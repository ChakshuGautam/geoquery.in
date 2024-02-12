import * as fs from 'fs';
import Fuse from 'fuse.js';

export const Level = Object.freeze({
  STATE: {
    name: 'state',
    path: 'state',
    depth: 0
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
});

export class LocationSearch {
  constructor(filePath) {
    this.villagePreprocessedData = [];
    this.subDistrictPreprocessedData = [];
    this.districtPreprocessedData = [];
    this.statePreProcessedData = [];

    const jsonData = JSON.parse(fs.readFileSync(filePath));
    
    jsonData.forEach(stateData => {
      stateData.districts.forEach(districtData => {
        districtData.subDistricts.forEach(subDistrictData => {
          subDistrictData.villages.forEach(village => {
            if (village !== null) {
              this.villagePreprocessedData.push({
                state: stateData.state,
                district: districtData.district,
                subDistrict: subDistrictData.subDistrict,
                village: village,
              })
            }
          });
          this.subDistrictPreprocessedData.push({
            state: stateData.state,
            district: districtData.district,
            subDistrict: subDistrictData.subDistrict,
          })
        });
        this.districtPreprocessedData.push({
          state: stateData.state,
          district: districtData.district,
        })
      });
      this.statePreProcessedData.push({
        state: stateData.state
      })
    });
  }

  fuzzySearch(level, query, filters) {
    return this.#querySearch(level, query, 0.1, 0, filters);
  }

  search(level, query, filters) {
    return this.#querySearch(level, query, 0.0, 0, filters)
  }

  #querySearch(searchLevel, query, threshold, distance = 0, filters = null) {
    const options = {
      keys: [searchLevel.name],
      threshold,
      distance,
      isCaseSensitive: false,
    };
    let processedData;
    switch (searchLevel) {
      case Level.STATE:
        processedData = this.statePreProcessedData;
        break;
      case Level.DISTRICT:
        processedData = this.districtPreprocessedData;
        break;
      case Level.SUBDISTRICT:
        processedData = this.subDistrictPreprocessedData;
        break;
      case Level.VILLAGE:
        processedData = this.villagePreprocessedData;
        break;
      default:
        // Unreachable
        break;
    }
    
    if (filters !== null) {
      for (let nodeDepth = 0; nodeDepth < searchLevel.depth; nodeDepth++) {
        for (const filter of filters) {
          if (filter.level.depth !== nodeDepth) continue;
          let filteredData = [];
          for (let index = 0; index < processedData.length; index++) {
            if (processedData[index][`${filter.level.name}`].toLowerCase().includes(filter.query.toLowerCase())) {
              filteredData.push(processedData[index]);
            }
          }
          processedData = filteredData;
        }
      }
    }
    const fuse = new Fuse(processedData, options);
    const result = fuse.search(query);
    return result.map(entry => ({
      ...entry.item
    }));
  }
}