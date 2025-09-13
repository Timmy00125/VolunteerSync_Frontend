import { TestBed } from '@angular/core/testing';

import { EventUiService } from './event-ui';

describe('EventUi', () => {
  let service: EventUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
