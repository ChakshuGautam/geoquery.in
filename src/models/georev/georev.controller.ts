import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeojsonService } from 'src/services/geojson/geojson.service';
import { GeoqueryService } from 'src/services/geoquery/geoquery.service';
import { formatGeorevSuccessResponse } from 'src/utils/serializer/success';

@Controller('georev')
export class GeorevController {
    private readonly logger = new Logger(GeorevController.name);
    private readonly geoJsonFiles: { [key: string]: any };
    constructor(private readonly geoQueryService: GeoqueryService, private readonly geoJsonService: GeojsonService, private readonly configService: ConfigService){
        this.geoJsonFiles = geoJsonService.getGeoJsonFiles();
    }

 @Get()
  async getGeoRev(@Query('lat') lat: string, @Query('lon') lon: string) {
    try {
      if (!lat || !lon) {
        this.logger.error(`lat lon query missing`);
        return { status: 'fail', error: `lat lon query missing` };
      }

      // Searching for SUBDISTRICT GeoLocation Level
      const resp = this.geoQueryService.individualQuery(this.configService.get<string>('country'), this.configService.get<string>('geoLocationLevels.SUBDISTRICT'), [parseFloat(lon), parseFloat(lat)], this.geoJsonFiles);

      if (!resp) {
        this.logger.error(`No GeoLocation found for lat: ${lat}, lon: ${lon}`);
        return { status: "fail", error: `No GeoLocation found for lat: ${lat}, lon: ${lon}` };
      }

      this.logger.log(`GeoRev Success Response: ${JSON.stringify(resp)}`);
      return formatGeorevSuccessResponse(resp);
    } catch (error) {
      this.logger.error(`Error processing lat lon: ${error.name}`);
      return { status: "fail", error: error.message };
    }
  }
}
