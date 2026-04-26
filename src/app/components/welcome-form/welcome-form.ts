import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-welcome-form',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './welcome-form.html',
  styleUrl: './welcome-form.scss',
})
export class WelcomeForm {
  userName: string = '';
  isListening: boolean = false;
  recognition: any;
  maxCharacters: number = 15;
  private silenceTimer: any;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {
    this.initializeSpeechRecognition();
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    
    this.silenceTimer = setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isListening) {
          this.recognition.stop();
        }
      });
    }, 2000);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          this.isListening = true;
          this.resetSilenceTimer();
          this.cdr.detectChanges();
        });
      };

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          this.resetSilenceTimer();
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          const cleanedText = fullTranscript.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '');
          this.userName = cleanedText.substring(0, this.maxCharacters).trim();
          this.cdr.detectChanges();
        });
      };

      this.recognition.onerror = (event: any) => {
        this.ngZone.run(() => {
          this.isListening = false;
          this.clearSilenceTimer();
          this.cdr.detectChanges();
        });
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isListening = false;
          this.clearSilenceTimer();
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
    }
  }

  isSubmitDisabled(): boolean {
    return this.userName.trim().length === 0;
  }
}
