import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppNotificationComponent } from './notification';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AppNotificationComponent', () => {
  let component: AppNotificationComponent;
  let fixture: ComponentFixture<AppNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppNotificationComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppNotificationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('type', 'success');
    fixture.componentRef.setInput('message', 'Test message');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit onDismiss when dismiss is called', () => {
    spyOn(component.onDismiss, 'emit');
    fixture.componentRef.setInput('type', 'info');
    fixture.componentRef.setInput('message', 'Test message');
    fixture.detectChanges();

    component.dismiss();

    expect(component.onDismiss.emit).toHaveBeenCalled();
  });

  it('should auto-close after duration', async () => {
    spyOn(component, 'dismiss');
    fixture.componentRef.setInput('type', 'success');
    fixture.componentRef.setInput('message', 'Test');
    fixture.componentRef.setInput('autoClose', true);
    fixture.componentRef.setInput('duration', 100);
    fixture.detectChanges();

    // Wait for the duration using Promise-based delay instead of fakeAsync
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.dismiss).toHaveBeenCalled();
  });
});
