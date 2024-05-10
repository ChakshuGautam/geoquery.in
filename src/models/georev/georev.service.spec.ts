import { Test, TestingModule } from '@nestjs/testing';
import { GeorevService } from './georev.service';
import { ConfigService } from '@nestjs/config';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';
import { GeojsonService } from '../../services/geojson/geojson.service';

const constants = {
  getGeoRev: {
    success: {
      levelLocationName: 'Saraswati Vihar',
      OBJECTID: 430,
      stcode11: '07',
      dtcode11: '090',
      sdtcode11: '00431',
      Shape_Length: 107706.63225163253,
      Shape_Area: 199520680.70346165,
      stname: 'DELHI',
      dtname: 'North West',
      sdtname: 'Saraswati Vihar',
      Subdt_LGD: 431,
      Dist_LGD: 82,
      State_LGD: 7,
    },
  },
};

describe('GeorevService', () => {
  let service: GeorevService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeorevService,
        GeojsonService,
        GeoqueryService,
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

    service = module.get<GeorevService>(GeorevService);
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call individualQuery method with correct parameters', () => {
    const lat = '10.12345';
    const lon = '20.67890';

    jest.spyOn(service, 'getGeoRev').mockReturnValue(constants.getGeoRev.success);

    const result = service.getGeoRev(lat, lon);

    expect(result).toEqual(constants.getGeoRev.success);
  });

  it('should handle a missing coordinate', () => {
    jest.spyOn(service, 'getGeoRev').mockReturnValue(Error('coordinates must contain numbers'))
    let result = service.getGeoRev(null, '20.67890');
    expect(result).toEqual(Error('coordinates must contain numbers'));
  });
});
