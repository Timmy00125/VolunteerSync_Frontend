import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityIndicator } from './capacity-indicator';

describe('CapacityIndicator', () => {
  let component: CapacityIndicator;
  let fixture: ComponentFixture<CapacityIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacityIndicator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapacityIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
