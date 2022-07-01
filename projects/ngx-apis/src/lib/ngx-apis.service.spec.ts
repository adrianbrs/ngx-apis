import { TestBed } from '@angular/core/testing';

import { NgxApisService } from './ngx-apis.service';

describe('NgxApisService', () => {
  let service: NgxApisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxApisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
