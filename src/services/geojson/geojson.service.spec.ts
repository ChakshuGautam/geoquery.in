import { Test, TestingModule } from '@nestjs/testing';
import { GeojsonService } from './geojson.service';
import { ConfigService } from '@nestjs/config';

describe('GeojsonService', () => {
  let service: GeojsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeojsonService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'requiredGeoLocationLevels':
                  return ['SUBDISTRICT', 'DISTRICT', 'STATE'];
                case 'country':
                  return 'INDIA';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GeojsonService>(GeojsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
