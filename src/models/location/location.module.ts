import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LocationSearchService } from './location.search-service';
import { GeojsonService } from '../../services/geojson/geojson.service';
import * as path from 'path';

@Module({
  controllers: [LocationController],
  providers: [
    {
      useFactory: () => {
        const filePath = path.join(
          process.cwd(),
          './src/geojson-data/PARSED_MASTER_LOCATION_NAMES.json',
        );
        return new LocationSearchService(filePath);
      },
      provide: LocationSearchService,
    },
    GeojsonService,
    LocationService,
  ],
})
export class LocationModule {}
