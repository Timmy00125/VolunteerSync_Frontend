import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventStats } from './event-stats';

describe('EventStats', () => {
  let component: EventStats;
  let fixture: ComponentFixture<EventStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
