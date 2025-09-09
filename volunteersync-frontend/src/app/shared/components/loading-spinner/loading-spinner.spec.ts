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
});
