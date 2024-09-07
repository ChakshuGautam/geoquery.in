import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';

@Injectable()
export class GeorevService {
  private readonly geoJsonFiles: { [key: string]: any };

  constructor(
    private readonly geoQueryService: GeoqueryService,
    private readonly configService: ConfigService,
  ) {
  }

  async getGeoRev(lat: string, lon: string) {
    try {
      return await this.geoQueryService.querySubDistrictContains(parseFloat(lat), parseFloat(lon));
    } catch (error) {
      throw error;
    }
  }


  isValidLatitudeLongitude(lat: string, lon: string) {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    const isValidLat = !isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90;
    const isValidLon = !isNaN(parsedLon) && parsedLon >= -180 && parsedLon <= 180;

    return isValidLat && isValidLon;
  }
}
