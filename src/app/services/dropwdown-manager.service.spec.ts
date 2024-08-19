import { TestBed } from '@angular/core/testing';

import { DropdownManagerService } from './dropwdown-manager.service';

describe('DropdownManagerService', () => {
  let service: DropdownManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
