import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CityService } from './city.service';
import { formatSuccessResponse } from '../../utils/serializer/success';
import { formatErrorResponse } from '../../utils/serializer/error';

@ApiTags('/city')
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get(':ip')
  getCity(@Param('ip') ip: string) {
    try {
      const city = this.cityService.getCity(ip);
      return formatSuccessResponse(city);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('batch')
  async findCityWithIpBatch(@Body('ips') ips: string[]) {
    try {
      const promises = ips.map((ip) => {
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
