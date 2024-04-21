import { Injectable, Logger } from '@nestjs/common';
import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CityService {
  private readonly reader: ReaderModel;
  private readonly logger = new Logger(CityService.name);

  constructor() {
    const buffer = fs.readFileSync(path.join(process.cwd(), './db.mmdb'));
    this.reader = Reader.openBuffer(buffer);
  }

  getCity(ip: string) {
    if (!ip) {
      throw new Error('No IP provided');
    }

    try {
      const response = this.reader.city(ip);
      this.logger.log(`City Success Response: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(`Error processing IP: ${ip}, Error: ${error.name}`);
      throw error;
    }
  }
}