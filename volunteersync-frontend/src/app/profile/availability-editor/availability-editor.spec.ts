import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityEditor } from './availability-editor';

describe('AvailabilityEditor', () => {
  let component: AvailabilityEditor;
  let fixture: ComponentFixture<AvailabilityEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
