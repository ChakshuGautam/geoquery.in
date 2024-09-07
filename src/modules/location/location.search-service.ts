import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';


@Injectable()
export class LocationSearchService {
  logger = new Logger(LocationSearchService.name);

  constructor(private readonly config: ConfigService, private readonly geoquery: GeoqueryService) {

  }

  fuzzySearch(level: string, query: string, filters) {
    return this.querySearch(level, query, 0.1, 0, filters);
  }

  search(level: string, query: string, filters) {
    return this.querySearch(level, query, 0.0, 0, filters);
  }

  private async querySearch(
    searchLevel: string,
    query: string,
    threshold: number,
    distance: number = 0,
    filters,
  ) {
    const { state_name, district_name, subdistrict_name } = filters;

    let result;

    switch (searchLevel.toLowerCase()) {
      case 'state':
        break;
      case 'district':
        result = await this.geoquery.fuzzyDistrictSearch(query, { state_name });
        break;
      case 'subdistrict':
        result = await this.geoquery.fuzzySubDistrictSearch(query, { state_name, district_name });
        break;
      case 'village':
        result = await this.geoquery.fuzzyVillageSearch(query, { state_name, district_name, subdistrict_name });
        break;
    }
    this.logger.log(result);
    return {
      matches: result.map((item: any) => ({
        state: item.state_name || state_name || null,
        district: item.district_name || district_name || null,
        subDistrict: item.subdistrict_name || subdistrict_name || null,
        village: item.village_name || null,
      })),
    };
  }
}
