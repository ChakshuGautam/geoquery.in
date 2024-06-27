import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { LocationService } from './location.service';
import { GeojsonService } from '../../services/geojson/geojson.service';
import * as turf from '@turf/turf';

jest.mock('@nestjs/common/services/logger.service');
jest.mock('@turf/turf');

describe('LocationService', () => {
  let service: LocationService;
  let configService: ConfigService;
  let geojsonService: GeojsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('testCountry'),
          },
        },
        {
          provide: GeojsonService,
          useValue: {
            getGeoJsonFiles: jest.fn().mockReturnValue({
              testCountry_state: {
                features: [
                  {
                    properties: { levelLocationName: 'testState' },
                    geometry: {
                      type: 'Polygon',
                      coordinates: [
                        [
                          [0, 0],
                          [1, 0],
                          [1, 1],
                          [0, 1],
                          [0, 0],
                        ],
                      ],
                    },
                  },
                ],
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    configService = module.get<ConfigService>(ConfigService);
    geojsonService = module.get<GeojsonService>(GeojsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct centroid for a given location', () => {
    const centroidMock = { geometry: { coordinates: [0.5, 0.5] } };
    (turf.centroid as jest.Mock).mockReturnValue(centroidMock);

    const result = service.getCentroid('state', 'testState');

    expect(result).toEqual({
      properties: { levelLocationName: 'testState' },
      latitude: 0.5,
      longitude: 0.5,
    });

    expect(turf.centroid).toHaveBeenCalledWith(
      turf.polygon([
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ]),
    );
  });

  it('should throw an error if the location is not found', () => {
    expect(() => service.getCentroid('state', 'invalidState')).toThrowError(
      'No state found with name: invalidState',
    );
  });
});
