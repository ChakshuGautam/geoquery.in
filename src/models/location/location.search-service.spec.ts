import { Test, TestingModule } from '@nestjs/testing';
import { LocationSearchService } from './location.search-service';
import { ConfigService } from '@nestjs/config';
import { GeojsonService } from '../../services/geojson/geojson.service';

const FILE_PATH = 'filePath'; // Token to inject filePath string

describe('LocationService', () => {
  let service: LocationSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationSearchService,
        {
          provide: LocationSearchService,
          useFactory: () => {
            const filePath =
              './src/geojson-data/PARSED_MASTER_LOCATION_NAMES.json';
            return new LocationSearchService(filePath);
          },
        },
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

    service = module.get<LocationSearchService>(LocationSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
