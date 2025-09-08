import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply size and color classes', () => {
    component.size = input('lg');
    component.color = input('white');
    fixture.detectChanges();

    expect(component.sizeClasses).toBe('h-12 w-12');
    expect(component.colorClasses).toBe('text-white');
  });
});

// Helper to deal with signal inputs in tests
import { input } from '@angular/core';

