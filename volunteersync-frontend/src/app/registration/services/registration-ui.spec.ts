import { TestBed } from '@angular/core/testing';

import { RegistrationUiService } from './registration-ui';

describe('RegistrationUiService', () => {
  let service: RegistrationUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrationUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
