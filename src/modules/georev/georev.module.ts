import { Module } from '@nestjs/common';
import { GeorevController } from './georev.controller';
import { GeorevService } from './georev.service';
import { GeoqueryService } from '../../services/geoquery/geoquery.service';

@Module({
  controllers: [GeorevController],
  providers: [GeorevService, GeoqueryService],
})
export class GeorevModule {}
