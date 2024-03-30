import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GeojsonService {
  private readonly logger = new Logger(GeojsonService.name);
  private readonly geoJsonFilesPath: string;
  private readonly requiredGeoLocationLevels: Array<string>;
  private readonly country: string;
  private geoJsonFiles: { [key: string]: any } = {};

  constructor(private configService: ConfigService) {
    this.geoJsonFilesPath = path.join(process.cwd(), './src/geojson-data'); // Adjust the path as needed
    this.requiredGeoLocationLevels = this.configService.get<Array<string>>('requiredGeoLocationLevels');
    this.country = this.configService.get<string>('country');
    this.loadGeoJsonFiles();
  }

  private loadGeoJsonFiles(): void {
    try {
      const files = fs.readdirSync(this.geoJsonFilesPath);
      for (const locationLevel of this.requiredGeoLocationLevels) {
        const geoJsonFileName = `${this.country}_${locationLevel}.geojson`;
        const geoJsonKeyName = `${this.country}_${locationLevel}`;
        if (!files.includes(geoJsonFileName)) {
          this.logger.error(
            `Required GeoJson file: ${geoJsonFileName} not present`,
          );
          process.exit();
        } else {
          this.geoJsonFiles[geoJsonKeyName] = JSON.parse(
            fs.readFileSync(
              `${this.geoJsonFilesPath}/${geoJsonFileName}`,
              'utf8',
            ),
          );
          this.logger.log(`Loaded GeoJson file: ${geoJsonFileName}`);
        }
      }
    } catch (err) {
      this.logger.error(`Error loading GeoJson files: ${err}`);
      process.exit();
    }
  }

  getGeoJsonFiles(): { [key: string]: any } {
    return this.geoJsonFiles;
  }
}
