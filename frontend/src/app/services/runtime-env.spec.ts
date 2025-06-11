import { TestBed } from '@angular/core/testing';

import { RuntimeEnv } from './runtime-env';

describe('RuntimeEnv', () => {
  let service: RuntimeEnv;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RuntimeEnv);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
