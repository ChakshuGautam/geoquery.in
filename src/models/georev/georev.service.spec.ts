import { Test, TestingModule } from '@nestjs/testing';
import { GeorevService } from './georev.service';

describe('GeorevService', () => {
  let service: GeorevService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeorevService],
    }).compile();

    service = module.get<GeorevService>(GeorevService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
