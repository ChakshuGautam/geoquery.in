import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly country: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly geoQueryService: GeoqueryService,
  ) {
  }

  async getCentroid(locationLevel: string, query: string) {
    try {
      const tableMeta = this.configService.get(`tableMeta.${locationLevel}`);
      let resp: any = await this.geoQueryService.geometryCentroid(tableMeta, query);
      resp = resp[0];
      const { coordinates } = JSON.parse(resp.coordinate);
      this.logger.log(
        `Centroid Success Response: ${resp}`,
      );
      return { properties: resp, latitude: coordinates[1], longitude: coordinates[0] };
    } catch (error) {
      throw error;
    }
  }
}
