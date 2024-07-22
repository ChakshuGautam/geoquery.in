import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { ConfigService } from '@nestjs/config';
import { LocationSearchService } from './location.search-service';
import { LocationService } from './location.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

describe('LocationController', () => {
  let controller: LocationController;
  let configService: ConfigService;
  let locationSearchService: LocationSearchService;
  let locationService: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'geoLocationLevels') {
                return {
                  VILLAGE: 'VILLAGE',
                  SUBDISTRICT: 'SUBDISTRICT',
                  DISTRICT: 'DISTRICT',
                  STATE: 'STATE',
                };
              } else if (key === 'levelsMapping') {
                return {
                  STATE: {
                    name: 'state',
                    path: 'state',
                    depth: 0,
                  },
                  DISTRICT: {
                    name: 'district',
                    path: 'state->district',
                    depth: 1,
                  },
                  SUBDISTRICT: {
                    name: 'subDistrict',
                    path: 'state->district->subDistrict',
                    depth: 2,
                  },
                  VILLAGE: {
                    name: 'village',
                    path: 'state->district->subDistrict->village',
                    depth: 3,
                  },
                };
              }
            }),
          },
        },
        {
          provide: LocationSearchService,
          useValue: {
            fuzzySearch: jest.fn(() => ({ result: 'mocked result' })),
          },
        },
        {
          provide: LocationService,
          useValue: {
            getCentroid: jest.fn(() => ({
              properties: {
                levelLocationName: 'Lucknow',
                dtname: 'Lucknow',
                stname: 'UTTAR PRADESH',
                stcode11: '09',
                dtcode11: '157',
                year_stat: '2011_c',
                SHAPE_Length: 424086.646831452,
                SHAPE_Area: 3190740670.6066375,
                OBJECTID: 229,
                test: null,
                Dist_LGD: 162,
                State_LGD: 9,
              },
              latitude: 26.830190863213858,
              longitude: 80.89119983155268,
            })),
          },
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    configService = module.get<ConfigService>(ConfigService);
    locationSearchService = module.get<LocationSearchService>(
      LocationSearchService,
    );
    locationService = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle missing query parameter in getCentroid', () => {
    expect(() => controller.getCentroid('state', null)).toThrow(HttpException);
  });

  it('should call getCentroid method with correct parameters', () => {
    const result = controller.getCentroid('DISTRICT', 'lucknow');
    expect(result).toEqual({
      status: 'success',
      state: 'UTTAR PRADESH',
      district: 'Lucknow',
      subDistrict: '',
      city: '',
      block: '',
      village: '',
      lat: 26.830190863213858,
      lon: 80.89119983155268,
    });
  });

  it('should handle missing query parameter in fuzzySearch', () => {
    expect(() => controller.fuzzySearch('state', { query: null })).toThrow(
      HttpException,
    );
  });

  it('should handle unsupported GeoLocation Level in fuzzySearch', () => {
    expect(() =>
      controller.fuzzySearch('country', { query: 'testQuery' }),
    ).toThrow(HttpException);
  });

  it('should call fuzzySearch method with correct parameters', () => {
    const result = controller.fuzzySearch('state', { query: 'testQuery' });
    expect(result).toEqual({ result: 'mocked result' });
  });
});
