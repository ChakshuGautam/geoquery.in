import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { ConfigService } from '@nestjs/config';
import { LocationSearchService } from './location.search-service';
import { LocationService } from './location.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('LocationController', () => {
  let locationController: LocationController;
  let locationService: LocationService;
  let locationSearchService: LocationSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            getCentroid: jest.fn(), // Mock the method for LocationService
          },
        },
        {
          provide: LocationSearchService,
          useValue: {
            fuzzySearch: jest.fn((
              locationLevel,
                query,
                filter
            ) => {
              return [{"name": "Location 1"}]
            }), // Mock the method for LocationSearchService
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'tableMeta') {
                return { LEVEL1: 'Level 1', LEVEL2: 'Level 2' };
              } else if (key === 'levelsMapping') {
                return { LEVEL1: 'Mapping 1', LEVEL2: 'Mapping 2' };
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    locationController = module.get<LocationController>(LocationController);
    locationService = module.get<LocationService>(LocationService);
    locationSearchService = module.get<LocationSearchService>(
      LocationSearchService,
    );
  });

  it('should be defined', () => {
    expect(locationController).toBeDefined();
  });

  describe('health', () => {
    it('should return "up" message', () => {
      expect(locationController.health()).toEqual({ message: 'up' });
    });
  });

  describe('getCentroid', () => {
    it('should throw BAD_REQUEST if query is missing', async () => {
      await expect(
        locationController.getCentroid('LEVEL1', ''),
      ).rejects.toThrow(HttpException);
      await expect(
        locationController.getCentroid('LEVEL1', ''),
      ).rejects.toThrow(`No LEVEL1 query found`);
    });

    it('should return centroid data when query is valid', async () => {
      const mockCentroidResponse = {
        properties: { name: 'Location' },
        latitude: 12.9716,
        longitude: 77.5946,
      };

      jest
        .spyOn(locationService, 'getCentroid')
        .mockResolvedValueOnce(mockCentroidResponse);

      const result = await locationController.getCentroid('LEVEL1', 'query');
      expect(result).toEqual({
        "block": "",
        "city": "",
        "district": "",
        "lat": 12.9716,
        "lon": 77.5946,
        "state": "",
        "status": "success",
        "subDistrict": "",
        "village": "",
      });
    });

    it('should throw NOT_FOUND if location service throws an error', async () => {
      jest
        .spyOn(locationService, 'getCentroid')
        .mockRejectedValueOnce(new Error('NotFoundError'));

      await expect(
        locationController.getCentroid('LEVEL1', 'query'),
      ).rejects.toThrow(HttpException);
      await expect(
        locationController.getCentroid('LEVEL1', 'query'),
      ).rejects.toThrow('TypeError');
    });
  });

});
