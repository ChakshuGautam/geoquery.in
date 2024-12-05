import { Test, TestingModule } from '@nestjs/testing';
import { GeorevService } from './georev.service';
import { ConfigService } from '@nestjs/config';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';
import { PrismaService } from '../prisma/prisma.service';

const constants = {
  getGeoRev: {
    success: {
      state_name: 'DELHI',
      district_name: 'North West',
      subdistrict_name: 'Saraswati Vihar',
    },
  },
};

describe('GeorevService', () => {
  let service: GeorevService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeorevService,
        {
          provide: PrismaService, // Mock PrismaService here
          useValue: {
            // Mocked methods of PrismaService, if needed
            $queryRawUnsafe: jest.fn((query: string) => {
              return [{
                state_name: 'DELHI',
                district_name: 'North West',
                subdistrict_name: 'Saraswati Vihar',
              }]
            }),
          },
        },
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

  it('should call individualQuery method with correct parameters', async () => {
    const lat = '10.12345';
    const lon = '20.67890';

    // jest
    //   .spyOn(service, 'getGeoRev')
    //   .mockReturnValue(constants.getGeoRev.success);

    const result = await service.getGeoRev(lat, lon);

    expect(result).toEqual([constants.getGeoRev.success]);
  });
});
