import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LocationService } from './location.service';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';
import { Logger } from '@nestjs/common';

describe('LocationService', () => {
  let locationService: LocationService;
  let configService: ConfigService;
  let geoQueryService: GeoqueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(), // Mock method
          },
        },
        {
          provide: GeoqueryService,
          useValue: {
            geometryCentroid: jest.fn(), // Mock method
          },
        },
        Logger, // NestJS logger service
      ],
    }).compile();

    locationService = module.get<LocationService>(LocationService);
    configService = module.get<ConfigService>(ConfigService);
    geoQueryService = module.get<GeoqueryService>(GeoqueryService);
  });

  it('should be defined', () => {
    expect(locationService).toBeDefined();
  });

  describe('getCentroid', () => {
    it('should return centroid data for valid locationLevel and query', async () => {
      const locationLevel = 'LEVEL1';
      const query = 'some query';

      // Mock ConfigService.get to return a value for the tableMeta
      jest.spyOn(configService, 'get').mockReturnValue('mockTableMeta');

      // Mock GeoqueryService.geometryCentroid to return valid centroid data
      const mockResponse = [
        {
          coordinate: JSON.stringify({
            coordinates: [77.5946, 12.9716], // Longitude, Latitude
          }),
          name: 'Sample Location',
        },
      ];
      jest
        .spyOn(geoQueryService, 'geometryCentroid')
        .mockResolvedValueOnce(mockResponse);

      const result = await locationService.getCentroid(locationLevel, query);

      expect(result).toEqual({
        properties: mockResponse[0],
        latitude: 12.9716,
        longitude: 77.5946,
      });
      expect(configService.get).toHaveBeenCalledWith(`tableMeta.${locationLevel}`);
      expect(geoQueryService.geometryCentroid).toHaveBeenCalledWith('mockTableMeta', query);
    });

    it('should throw an error when geoQueryService fails', async () => {
      const locationLevel = 'LEVEL1';
      const query = 'some query';

      // Mock ConfigService.get to return a value for the tableMeta
      jest.spyOn(configService, 'get').mockReturnValue('mockTableMeta');

      // Mock GeoqueryService.geometryCentroid to throw an error
      jest
        .spyOn(geoQueryService, 'geometryCentroid')
        .mockRejectedValueOnce(new Error('Service Error'));

      await expect(
        locationService.getCentroid(locationLevel, query),
      ).rejects.toThrow('Service Error');

      expect(configService.get).toHaveBeenCalledWith(`tableMeta.${locationLevel}`);
      expect(geoQueryService.geometryCentroid).toHaveBeenCalledWith('mockTableMeta', query);
    });
  });
});
