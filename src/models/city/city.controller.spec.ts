import { Test, TestingModule } from '@nestjs/testing';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { HttpException } from '@nestjs/common';

describe('CityController', () => {
  let controller: CityController;
  let service: CityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [CityService],
    }).compile();

    controller = module.get<CityController>(CityController);
    service = module.get<CityService>(CityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /city/:ip', () => {
    it('should return city information for a valid IP', () => {
      const validIp = '2401:4900:1c82:377e:bb89:dfc9:28a1:1e06';
      const cityInfo = {
        status: 'success',
        continent: 'Asia',
        continentCode: 'AS',
        country: 'India',
        countryCode: '',
        region: 'UP',
        regionName: 'Uttar Pradesh',
        city: 'Lucknow',
        zip: '226004',
        lat: 26.8756,
        lon: 80.9115,
        timezone: 'Asia/Kolkata',
        proxy: false,
        hosting: false,
        query: '2401:4900:1c82:377e:bb89:dfc9:28a1:1e06',
      };
      const result = controller.getCity(validIp);
      expect(result).toEqual(cityInfo);
    });

    it('should throw a bad request exception for an invalid IP', () => {
      const invalidIp = 'invalid-ip';
      expect(() => controller.getCity(invalidIp)).toThrow(HttpException);
      expect(() => controller.getCity(invalidIp)).toThrow('invalid-ip is invalid');
    });
  });

  describe('POST /city/batch', () => {
    it('should return city information for an array of valid IPs', async () => {
      const validIps = [
        '128.101.101.101',
        '2401:4900:1c82:377e:bb89:dfc9:28a1:1e06',
      ];
      const citiesInfo = [
        {
          status: 'success',
          continent: 'North America',
          continentCode: 'NA',
          country: 'United States',
          countryCode: '',
          region: 'MN',
          regionName: 'Minnesota',
          city: 'Minneapolis',
          zip: '55409',
          lat: 44.9273,
          lon: -93.2765,
          timezone: 'America/Chicago',
          proxy: false,
          hosting: false,
          query: '128.101.101.101',
        },
        {
          status: 'success',
          continent: 'Asia',
          continentCode: 'AS',
          country: 'India',
          countryCode: '',
          region: 'UP',
          regionName: 'Uttar Pradesh',
          city: 'Lucknow',
          zip: '226004',
          lat: 26.8756,
          lon: 80.9115,
          timezone: 'Asia/Kolkata',
          proxy: false,
          hosting: false,
          query: '2401:4900:1c82:377e:bb89:dfc9:28a1:1e06',
        },
      ];

      const result = await controller.findCityWithIpBatch(validIps);
      expect(result).toEqual(citiesInfo);
    });

    it('should return error responses for invalid IPs', async () => {
      const invalidIps = ['invalid', 'invalid-ip'];
      const cityInfo = [
        { status: 'fail', message: 'ValueError', query: 'invalid' },
        { status: 'fail', message: 'ValueError', query: 'invalid-ip' },
      ];

      const result = await controller.findCityWithIpBatch(invalidIps);

      expect(result.length).toBe(2);
      expect(result).toEqual(cityInfo);
    });
  });
});
