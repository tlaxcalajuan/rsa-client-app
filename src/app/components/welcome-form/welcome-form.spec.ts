import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeForm } from './welcome-form';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment } from '../../enviroments/environment';

describe('WelcomeForm', () => {
  let component: WelcomeForm;
  let fixture: ComponentFixture<WelcomeForm>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeForm, MatSnackBarModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WelcomeForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable submit button when userName is empty', () => {
    component.userName = '   ';
    expect(component.isSubmitDisabled()).toBeTrue();

    component.userName = 'John';
    expect(component.isSubmitDisabled()).toBeFalse();
  });

  it('should toggle voice recognition correctly', () => {
    // Mock the recognition object
    component.recognition = {
      start: jasmine.createSpy('start'),
      stop: jasmine.createSpy('stop')
    };

    // Test starting recognition
    component.isListening = false;
    component.toggleVoiceRecognition();
    expect(component.userName).toBe('');
    expect(component.recognition.start).toHaveBeenCalled();

    // Test stopping recognition
    component.isListening = true;
    component.toggleVoiceRecognition();
    expect(component.recognition.stop).toHaveBeenCalled();
  });

  it('should send HTTP request when submitName is called with valid user name', () => {
    component.userName = 'TestUser';
    component.submitName();

    const req = httpMock.expectOne(`${environment.apiUrl}/encrypt`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ text: 'TestUser' });

    req.flush({ original: 'TestUser', encrypted: 'Encrypted123' });

    expect(component.encryptedText).toBe('Encrypted123');
  });

  it('should not send HTTP request when userName is empty', () => {
    component.userName = '';
    component.submitName();

    httpMock.expectNone(`${environment.apiUrl}/encrypt`);
  });

  it('should copy text to clipboard and show snackbar', async () => {
    const snackBarSpy = spyOn((component as any).snackBar, 'open');
    const clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    component.encryptedText = 'SomeEncryptedText';
    component.copyToClipboard();

    expect(clipboardSpy).toHaveBeenCalledWith('SomeEncryptedText');

    // Wait for the Promise resolution
    await fixture.whenStable();

    expect(snackBarSpy).toHaveBeenCalledWith('¡Copiado al portapapeles!', 'Cerrar', jasmine.any(Object));
  });

  it('should not copy to clipboard if encryptedText is empty', () => {
    const clipboardSpy = spyOn(navigator.clipboard, 'writeText');
    component.encryptedText = '';
    component.copyToClipboard();

    expect(clipboardSpy).not.toHaveBeenCalled();
  });
});

