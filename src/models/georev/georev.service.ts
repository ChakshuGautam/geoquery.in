import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeojsonService } from 'src/services/geojson/geojson.service';
import { GeoqueryService } from 'src/services/geoquery/geoquery.service';

@Injectable()
export class GeorevService {
  private readonly geoJsonFiles: { [key: string]: any };

  constructor(
    private readonly geoQueryService: GeoqueryService,
    private readonly geoJsonService: GeojsonService,
    private readonly configService: ConfigService,
  ) {
    this.geoJsonFiles = geoJsonService.getGeoJsonFiles();
  }

  getGeoRev(lat: string, lon: string) {
    try {
      // Searching for SUBDISTRICT GeoLocation Level
      const response = this.geoQueryService.individualQuery(
        this.configService.get<string>('country'),
        this.configService.get<string>('geoLocationLevels.SUBDISTRICT'),
        [parseFloat(lon), parseFloat(lat)],
        this.geoJsonFiles,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}
