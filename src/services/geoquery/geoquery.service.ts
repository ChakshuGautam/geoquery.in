import { Injectable, Logger } from '@nestjs/common';
import * as turf from '@turf/turf';

@Injectable()
export class GeoqueryService {
  private readonly logger = new Logger(GeoqueryService.name);

  isPointInMultiPolygon(multiPolygon, point) {
    this.logger.log(`Checking if point is in MultiPolygon`);
    return multiPolygon.geometry.coordinates.some((polygonCoordinates) => {
      const poly = turf.polygon(polygonCoordinates);
      return turf.booleanContains(poly, point);
    });
  }

  individualQuery(
    country: string,
    geoLocationLevel: string,
    coordinates,
    geoJsonFiles,
  ) {
    const pointToSearch = turf.point(coordinates);
    for (const feature of geoJsonFiles[`${country}_${geoLocationLevel}`]
      .features) {
      if (feature.geometry.type === 'Polygon') {
        this.logger.log(`Checking if point is in Polygon`);
        const poly = turf.polygon(
          feature.geometry.coordinates,
          feature.properties,
        );
        if (turf.booleanContains(poly, pointToSearch)) {
          this.logger.log(`Point is in Polygon`);
          return poly.properties;
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        this.logger.log(`Checking if point is in MultiPolygon`);
        if (this.isPointInMultiPolygon(feature, pointToSearch)) {
          this.logger.log(`Point is in MultiPolygon`);
          return feature.properties;
        }
      }
    }
  }
}
