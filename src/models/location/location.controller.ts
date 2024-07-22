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
import { ApiTags } from '@nestjs/swagger';
import { formatCentroidResponse } from '../../utils/serializer/success';
import { LocationSearchService } from './location.search-service';
import { LocationService } from './location.service';
@ApiTags('/location')
@Controller('location')
export class LocationController {
  private readonly logger = new Logger(LocationController.name);
  private readonly geoLocationLevels: { [key: string]: any };
  private readonly levelsMapping: { [key: string]: any };

  constructor(
    private readonly configService: ConfigService,
    private readonly locationSearchService: LocationSearchService,
    private readonly locationService: LocationService,
  ) {
    this.geoLocationLevels = this.configService.get<{ [key: string]: any }>(
      'geoLocationLevels',
    );
    this.levelsMapping = this.configService.get<{ [key: string]: any }>(
      'levelsMapping',
    );
  }

  @Get(':locationlevel/centroid')
  getCentroid(
    @Param('locationlevel') locationLevel: string,
    @Query('query') query: string,
  ) {
    if (!query) {
      this.logger.error(`No ${locationLevel} query found`);
      throw new HttpException(
        `No ${locationLevel} query found`,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const response = this.locationService.getCentroid(locationLevel, query);
      return formatCentroidResponse(
        response.properties,
        response.latitude,
        response.longitude,
      );
    } catch (error) {
      this.logger.error(
        `Error processing ${locationLevel} query: ${error.name}`,
      );
      throw new HttpException(error.name, HttpStatus.NOT_FOUND);
    }
  }

  @Post(':locationlevel/fuzzysearch')
  fuzzySearch(
    @Param('locationlevel') locationLevel: string,
    @Body() body: any,
  ) {
    try {
      if (
        !Object.keys(this.geoLocationLevels).includes(
          locationLevel.toUpperCase(),
        )
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
        if (
          !Object.keys(this.geoLocationLevels).includes(filterKey.toUpperCase())
        ) {
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

      const queryResponse = this.locationSearchService.fuzzySearch(
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
