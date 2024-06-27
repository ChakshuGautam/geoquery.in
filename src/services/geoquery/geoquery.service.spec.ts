import { Test, TestingModule } from '@nestjs/testing';
import { GeoqueryService } from './geoquery.service';

describe('GeoqueryService', () => {
  let service: GeoqueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoqueryService],
    }).compile();

    service = module.get<GeoqueryService>(GeoqueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
