import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LocationSearchService } from './location.search-service';
import * as path from 'path';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';

@Module({
  controllers: [LocationController],
  providers: [
    LocationSearchService,
    GeoqueryService,
    LocationService,
  ],
})
export class LocationModule {}
