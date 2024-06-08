import { Test, TestingModule } from '@nestjs/testing';
import { GeojsonService } from './geojson.service';

describe('GeojsonService', () => {
  let service: GeojsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeojsonService],
    }).compile();

    service = module.get<GeojsonService>(GeojsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
