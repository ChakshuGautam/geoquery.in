import * as fs from 'fs';
import { Level, LocationSearchService } from './location.search-service';

jest.mock('fs');

describe('LocationSearchService', () => {
  let locationSearchService: LocationSearchService;

  const mockData = JSON.stringify([
    {
      state: 'State1',
      districts: [
        {
          district: 'District1',
          subDistricts: [
            {
              subDistrict: 'SubDistrict1',
              villages: ['Village1', 'Village2'],
            },
          ],
        },
      ],
    },
    {
      state: 'State2',
      districts: [
        {
          district: 'District2',
          subDistricts: [
            {
              subDistrict: 'SubDistrict2',
              villages: ['Village3', 'Village4'],
            },
          ],
        },
      ],
    },
  ]);

  beforeEach(() => {
    (fs.readFileSync as jest.Mock).mockReturnValue(mockData);
    locationSearchService = new LocationSearchService('mockFilePath');
  });

  it('should be defined', () => {
    expect(locationSearchService).toBeDefined();
  });

  it('should preprocess data correctly', () => {
    expect(locationSearchService['villagePreprocessedData']).toHaveLength(4);
    expect(locationSearchService['subDistrictPreprocessedData']).toHaveLength(
      2,
    );
    expect(locationSearchService['districtPreprocessedData']).toHaveLength(2);
    expect(locationSearchService['statePreProcessedData']).toHaveLength(2);
  });

  it('should return correct results for state level search', () => {
    const result = locationSearchService.search(Level.STATE, 'State1', null);
    expect(result).toEqual([{ state: 'State1' }]);
  });

  it('should return correct results for district level search', () => {
    const result = locationSearchService.search(
      Level.DISTRICT,
      'District1',
      null,
    );
    expect(result).toEqual([{ state: 'State1', district: 'District1' }]);
  });

  it('should return correct results for sub-district level search', () => {
    const result = locationSearchService.search(
      Level.SUBDISTRICT,
      'SubDistrict1',
      null,
    );
    expect(result).toEqual([
      { state: 'State1', district: 'District1', subDistrict: 'SubDistrict1' },
    ]);
  });

  it('should return correct results for village level search', () => {
    const result = locationSearchService.search(
      Level.VILLAGE,
      'Village1',
      null,
    );
    expect(result).toEqual([
      {
        state: 'State1',
        district: 'District1',
        subDistrict: 'SubDistrict1',
        village: 'Village1',
      },
    ]);
  });

  it('should apply filters correctly', () => {
    const filters = [{ level: Level.STATE, query: 'State1' }];
    const result = locationSearchService.search(
      Level.VILLAGE,
      'Village1',
      filters,
    );
    expect(result).toEqual([
      {
        state: 'State1',
        district: 'District1',
        subDistrict: 'SubDistrict1',
        village: 'Village1',
      },
    ]);
  });

  it('should return no results if no matches are found', () => {
    const result = locationSearchService.search(
      Level.VILLAGE,
      'NonExistentVillage',
      null,
    );
    expect(result).toEqual([]);
  });
});
