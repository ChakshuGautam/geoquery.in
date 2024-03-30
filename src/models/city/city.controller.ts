import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import * as fs from 'fs';
import * as path from 'path';
import { formatSuccessResponse } from 'src/utils/serializer/success';
import { formatErrorResponse } from 'src/utils/serializer/error';

@Controller('city')
export class CityController {
  private readonly reader: ReaderModel;
  private readonly logger = new Logger(CityController.name);

  constructor() {
    const buffer = fs.readFileSync(path.join(process.cwd(), './db.mmdb'));
    this.reader = Reader.openBuffer(buffer);
  }

  @Get(':ip')
  getCity(@Param('ip') ip: string) {
    if (!ip) {
      throw new HttpException(
        'No IP provided in params',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const resp = this.reader.city(ip);
      this.logger.log(`City Success Response: ${JSON.stringify(resp)}`);
      return formatSuccessResponse(resp);
    } catch (error) {
      this.logger.error(`Error processing IP: ${ip}, Error: ${error.name}`);
      throw new HttpException(
        `Error processing IP: ${ip}, Error: ${error.name}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('batch')
  async findCityWithIpBatch(@Body('ips') ips: string[]) {
    try {
      const promises = ips.map((ip) => {
        try {
          const response = this.reader.city(ip);
          return formatSuccessResponse(response);
        } catch (error) {
          return formatErrorResponse(error, ip);
        }
      });

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      throw new HttpException(
        'Error processing IP addresses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
