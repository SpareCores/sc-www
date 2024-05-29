import { TestBed } from '@angular/core/testing';

import { UsersAPIService } from './users-api.service';

describe('UsersAPIService', () => {
  let service: UsersAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
