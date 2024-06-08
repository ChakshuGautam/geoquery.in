import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { ConfigService } from '@nestjs/config';
import { GeojsonService } from '../../services/geojson/geojson.service';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'requiredGeoLocationLevels') {
                return ['SUBDISTRICT', 'DISTRICT', 'STATE'];
              } else if (key === 'country') {
                return 'INDIA';
              } else if (key === 'geoLocationLevels.SUBDISTRICT') {
                return 'SUBDISTRICT';
              }
              return null;
            }),
          },
        },
        GeojsonService,
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
