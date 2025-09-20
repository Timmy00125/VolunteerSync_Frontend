import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply size and color classes', () => {
    // Set component inputs directly using fixture.componentRef.setInput()
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'white');
    fixture.detectChanges();

    expect(component.sizeClasses).toBe('h-12 w-12');
    expect(component.colorClasses).toBe('text-white');
  });

  it('should handle blue color mapping to primary', () => {
    fixture.componentRef.setInput('color', 'blue');
    fixture.detectChanges();

    expect(component.colorClasses).toBe('text-blue-600');
  });

  it('should display text from text input', () => {
    fixture.componentRef.setInput('text', 'Loading data...');
    fixture.detectChanges();

    expect(component.displayText).toBe('Loading data...');
  });

  it('should display text from message input for backward compatibility', () => {
    fixture.componentRef.setInput('message', 'Please wait...');
    fixture.detectChanges();

    expect(component.displayText).toBe('Please wait...');
  });

  it('should prioritize text over message when both are provided', () => {
    fixture.componentRef.setInput('text', 'Text input');
    fixture.componentRef.setInput('message', 'Message input');
    fixture.detectChanges();

    expect(component.displayText).toBe('Text input');
  });

  it('should apply fullScreen styling when enabled', () => {
    fixture.componentRef.setInput('fullScreen', true);
    fixture.detectChanges();

    const containerElement = fixture.nativeElement.querySelector('div');
    expect(containerElement.className).toContain('fixed inset-0');
    expect(containerElement.className).toContain('bg-black bg-opacity-50');
  });

  it('should apply normal styling when fullScreen is disabled', () => {
    fixture.componentRef.setInput('fullScreen', false);
    fixture.detectChanges();

    const containerElement = fixture.nativeElement.querySelector('div');
    expect(containerElement.className).toContain('flex items-center justify-center');
    expect(containerElement.className).not.toContain('fixed inset-0');
  });
});
