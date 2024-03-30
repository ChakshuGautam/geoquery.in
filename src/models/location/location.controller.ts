import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as turf from '@turf/turf';
import { GeojsonService } from 'src/services/geojson/geojson.service';
import {
  formatCentroidResponse,
  formatSuccessResponse,
} from 'src/utils/serializer/success';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  private readonly logger = new Logger(LocationController.name);
  private readonly geoLocationLevels: { [key: string]: any };
  private readonly geoJsonFiles: { [key: string]: any };
  private readonly country: string;
  private readonly levelsMapping: { [key: string]: any };

  constructor(
    private readonly configService: ConfigService,
    private readonly geoJsonService: GeojsonService,
    private readonly locationService: LocationService
  ) {
    this.geoLocationLevels =
      this.configService.get<{ [key: string]: any }>('geoLocationLevels');
    this.geoJsonFiles = geoJsonService.getGeoJsonFiles();
    this.country = this.configService.get<string>('country');
    this.levelsMapping = this.configService.get<{ [key: string]: any }>('levelsMapping');
  }

  @Get(':locationlevel/centroid')
  getCentroid(
    @Param('locationlevel') locationLevel: string,
    @Query('query') query: string,
  ) {
    try {
      if (
        !Object.keys(this.geoLocationLevels).includes(
          locationLevel.toUpperCase(),
        )
      ) {
        this.logger.error(`Unsupported GeoLocation Level: ${locationLevel}`);
        throw new HttpException(
          `Unsupported GeoLocation Level: ${locationLevel}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!query) {
        this.logger.error(`No ${locationLevel} query found`);
        throw new HttpException(
          `No ${locationLevel} query found`,
          HttpStatus.BAD_REQUEST,
        );
      }

      let queryFeature;
      for (const feature of this.geoJsonFiles[
        `${this.country}_${locationLevel}`
      ].features) {
        if (
          feature.properties.levelLocationName.toLowerCase() ===
          query.toLowerCase()
        ) {
          queryFeature = feature;
          break;
        }
      }

      if (!queryFeature) {
        this.logger.error(`No ${locationLevel} found with name: ${query}`);
        throw new HttpException(
          `No ${locationLevel} found with name: ${query}`,
          HttpStatus.NOT_FOUND,
        );
      }

      let polygonFeature;
      if (queryFeature.geometry.type === 'Polygon') {
        polygonFeature = turf.polygon(queryFeature.geometry.coordinates);
      } else {
        polygonFeature = turf.multiPolygon(queryFeature.geometry.coordinates);
      }

      const centroid = turf.centroid(polygonFeature);
      const longitude = centroid.geometry.coordinates[0];
      const latitude = centroid.geometry.coordinates[1];

      this.logger.log(
        `Centroid Success Response: ${JSON.stringify(queryFeature.properties)}`,
      );
      return formatCentroidResponse(
        queryFeature.properties,
        latitude,
        longitude,
      );
    } catch (error) {
      this.logger.error(
        `Error processing ${locationLevel} query: ${error.name}`,
      );
      throw new HttpException(error.name, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':locationlevel/fuzzysearch')
  fuzzySearch(
    @Param('locationlevel') locationLevel: string,
    @Body() body: any,
  ) {
    try {
      if (
        !Object.keys(this.geoLocationLevels).includes(locationLevel.toUpperCase())
      ) {
        throw new HttpException(
          `Unsupported GeoLocation Level: ${locationLevel}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const query = body.query;
      if (!query) {
        throw new HttpException(
          `No ${locationLevel} query found`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const filter = body.filter || {};
      const filterArray = [];
      for (const filterKey of Object.keys(filter)) {
        if (!Object.keys(this.geoLocationLevels).includes(filterKey.toUpperCase())) {
          throw new HttpException(
            `Unsupported GeoLocation Level Filter: ${filterKey}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        filterArray.push({
          level: this.levelsMapping[filterKey.toUpperCase()],
          query: filter[filterKey],
        });
      }

      let searchLevel;
      switch (locationLevel.toUpperCase()) {
        case 'STATE':
          searchLevel = this.levelsMapping.STATE;
          break;
        case 'DISTRICT':
          searchLevel = this.levelsMapping.DISTRICT;
          break;
        case 'SUBDISTRICT':
          searchLevel = this.levelsMapping.SUBDISTRICT;
          break;
        case 'VILLAGE':
          searchLevel = this.levelsMapping.VILLAGE;
          break;
        default:
          throw new HttpException(
            'Invalid location level',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }

      const queryResponse = this.locationService.fuzzySearch(
        searchLevel,
        query,
        filterArray,
      );
      return queryResponse;
    } catch (error) {
      throw new HttpException(error.name, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
