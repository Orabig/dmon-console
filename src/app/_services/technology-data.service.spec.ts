import { TestBed, inject } from '@angular/core/testing';

import { TechnologyDataService } from './technology-data.service';

describe('TechnologyDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TechnologyDataService]
    });
  });

  it('should be created', inject([TechnologyDataService], (service: TechnologyDataService) => {
    expect(service).toBeTruthy();
  }));
});
