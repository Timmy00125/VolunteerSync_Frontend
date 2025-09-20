import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationHistory } from './registration-history';

describe('RegistrationHistory', () => {
  let component: RegistrationHistory;
  let fixture: ComponentFixture<RegistrationHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
