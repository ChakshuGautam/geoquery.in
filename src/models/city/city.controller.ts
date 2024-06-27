import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CityService } from './city.service';
import { formatSuccessResponse } from '../../utils/serializer/success';
import { formatErrorResponse } from '../../utils/serializer/error';

@ApiTags('/city')
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}
  private readonly logger = new Logger(CityController.name);

  @Get(':ip')
  getCity(@Param('ip') ip: string) {
    try {
      const city = this.cityService.getCity(ip);
      return formatSuccessResponse(city);
    } catch (error) {
      return formatErrorResponse(error, ip);
    }
  }

  @Post('batch')
  @HttpCode(200)
  async findCityWithIpBatch(@Body() ips: string[]) {
    this.logger.debug(ips);
    try {
      const promises = ips.map((ip) => {
        this.logger.debug(`Processing IP: ${ip}`);
        try {
          const city = this.cityService.getCity(ip);
          return formatSuccessResponse(city);
        } catch (error) {
          return formatErrorResponse(error, ip);
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
