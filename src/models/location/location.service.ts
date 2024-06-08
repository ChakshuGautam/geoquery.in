import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as turf from '@turf/turf';
import { GeojsonService } from '../..//services/geojson/geojson.service';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly geoJsonFiles: { [key: string]: any };
  private readonly country: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly geoJsonService: GeojsonService,
  ) {
    this.geoJsonFiles = this.geoJsonService.getGeoJsonFiles();
    this.country = this.configService.get<string>('country');
  }

  getCentroid(locationLevel: string, query: string) {
    try {
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
        throw new Error(`No ${locationLevel} found with name: ${query}`);
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
      return { properties: queryFeature.properties, latitude, longitude };
    } catch (error) {
      throw error;
    }
  }
}
