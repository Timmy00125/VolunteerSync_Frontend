import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppNotificationComponent } from './notification';
import { input } from '@angular/core';

describe('AppNotificationComponent', () => {
  let component: AppNotificationComponent;
  let fixture: ComponentFixture<AppNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppNotificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppNotificationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.type = input('success');
    component.message = input('Test message');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit onDismiss when dismiss is called', () => {
    spyOn(component.onDismiss, 'emit');
    component.type = input('info');
    component.message = input('Test message');
    fixture.detectChanges();

    component.dismiss();

    expect(component.onDismiss.emit).toHaveBeenCalled();
  });

  it('should auto-close after duration', fakeAsync(() => {
    spyOn(component, 'dismiss');
    component.type = input('success');
    component.message = input('Test');
    component.autoClose = input(true);
    component.duration = input(100);
    fixture.detectChanges();

    tick(100);
    expect(component.dismiss).toHaveBeenCalled();
  }));
});
