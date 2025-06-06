import { TestBed } from '@angular/core/testing';

import { BlindService } from './blind';

describe('Blind', () => {
  let service: BlindService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlindService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
