import { Module } from '@nestjs/common';
import { GeorevController } from './georev.controller';
import { GeorevService } from './georev.service';
import { GeojsonService } from '../../services/geojson/geojson.service';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';

@Module({
  controllers: [GeorevController],
  providers: [GeorevService, GeojsonService, GeoqueryService],
})
export class GeorevModule {}
