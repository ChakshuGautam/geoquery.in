import { Test, TestingModule } from '@nestjs/testing';
import { LocationSearchService } from './location.search-service';

describe('LocationService', () => {
  let service: LocationSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationSearchService],
    }).compile();

    service = module.get<LocationSearchService>(LocationSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
