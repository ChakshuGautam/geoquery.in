import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeorevController } from './georev.controller';
import { GeorevService } from './georev.service';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';
import { GeojsonService } from '../../services/geojson/geojson.service';

describe('GeorevController', () => {
  let controller: GeorevController;
  let service: GeorevService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeorevController],
      providers: [
        GeorevService,
        GeoqueryService,
        GeojsonService,
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
      ],
    }).compile();

    controller = module.get<GeorevController>(GeorevController);
    service = module.get<GeorevService>(GeorevService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGeoRev', () => {
    it('should return geo location data for valid coordinates', async () => {
      const lat = '28.7041';
      const lon = '77.1025';

      const mockResponse = {
        status: 'success',
        state: 'DELHI',
        district: 'North West',
        subDistrict: 'Saraswati Vihar',
      };

      const result = await controller.getGeoRev(lat, lon);

      expect(result).toEqual(mockResponse);
    });

    it('should handle missing lat lon query parameters', async () => {
      const lat = '';
      const lon = '';

      const result = await controller.getGeoRev(lat, lon);

      expect(result).toEqual({
        status: 'fail',
        error: 'lat lon query missing',
      });
    });

    it('should handle error when processing lat lon', async () => {
      const lat = 'invalid_lat'; // invalid latitude
      const lon = 'invalid_lon'; // invalid longitude

      const result = await controller.getGeoRev(lat, lon);

      expect(result).toEqual({
        status: 'fail',
        error: 'coordinates must contain numbers',
      });
    });

    it('should handle case when no GeoLocation found for given coordinates', async () => {
      const lat = '1.2345'; // valid latitude
      const lon = '2.3456'; // valid longitude

      const result = await controller.getGeoRev(lat, lon);

      expect(result).toEqual({
        status: 'fail',
        error: 'No GeoLocation found for lat: 1.2345, lon: 2.3456',
      });
    });
  });
});
