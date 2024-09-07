import { Body, Controller, Get, HttpException, HttpStatus, Logger, Param, Post, Query } from '@nestjs/common';
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
      'tableMeta',
    );
    this.levelsMapping = this.configService.get<{ [key: string]: any }>(
      'levelsMapping',
    );
  }

  @Get()
  health() {
    return {"message": "up"}
  }

  @Get(':locationlevel/centroid')
  async getCentroid(
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
      const response = await this.locationService.getCentroid(locationLevel, query);
      this.logger.log(response);
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
  async fuzzySearch(
    @Param('locationlevel') locationLevel: string,
    @Body() body: any, //
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

      return this.locationSearchService.fuzzySearch(
        locationLevel,
        query,
        filter,
      );
    } catch (error) {
      this.logger.error(error)
      throw new HttpException(error.name, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
