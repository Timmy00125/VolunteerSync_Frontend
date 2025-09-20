import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationCancellationDialogComponent } from './registration-cancellation-dialog';

describe('RegistrationCancellationDialogComponent', () => {
  let component: RegistrationCancellationDialogComponent;
  let fixture: ComponentFixture<RegistrationCancellationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationCancellationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationCancellationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
