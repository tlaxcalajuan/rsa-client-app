import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../enviroments/environment';

// Trigger rebuild

@Component({
  selector: 'app-welcome-form',
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './welcome-form.html',
  styleUrl: './welcome-form.scss',
})
export class WelcomeForm {
  userName: string = '';
  isListening: boolean = false;
  recognition: any;
  maxCharacters: number = 15;
  encryptedText: string = '';

  constructor(
    private ngZone: NgZone, 
    private cdr: ChangeDetectorRef, 
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      // Al usar continuous = false, el reconocimiento se detiene automáticamente 
      // cuando el usuario hace una pausa, lo que es ideal para inputs cortos.
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          this.isListening = true;
          this.cdr.detectChanges();
        });
      };

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }
          
          // Limpiar el texto: quitar espacios extras
          fullTranscript = fullTranscript.trim();

          // Permitir solo caracteres alfanuméricos (SIN espacios)
          const cleanedText = fullTranscript.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, '');
          this.userName = cleanedText.substring(0, this.maxCharacters).trim();
          this.cdr.detectChanges();
        });
      };

      this.recognition.onerror = (event: any) => {
        this.ngZone.run(() => {
          this.isListening = false;
          this.cdr.detectChanges();
        });
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isListening = false;
          this.cdr.detectChanges();
        });
      };
    }
  }

  toggleVoiceRecognition() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.userName = '';
      try {
        this.recognition.start();
      } catch (e) {
        this.isListening = false;
      }
    }
  }

  submitName() {
    if (this.userName.trim().length > 0) {
      console.log('Nombre ingresado:', this.userName);
      this.http.post<{ original: string, encrypted: string }>(`${environment.apiUrl}/encrypt`, { text: this.userName })
        .subscribe({
          next: (response) => {
            this.encryptedText = response.encrypted;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error encrypting name:', err);
          }
        });
    }
  }

  copyToClipboard() {
    if (this.encryptedText) {
      navigator.clipboard.writeText(this.encryptedText).then(() => {
        this.snackBar.open('¡Copiado al portapapeles!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      }).catch(err => {
        console.error('Error al copiar: ', err);
      });
    }
  }

  isSubmitDisabled(): boolean {
    return this.userName.trim().length === 0;
  }
}
