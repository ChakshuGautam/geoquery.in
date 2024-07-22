import { Test, TestingModule } from '@nestjs/testing';
import { CityService } from './city.service';
import { Logger } from '@nestjs/common';

describe('CityService', () => {
  let service: CityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CityService],
    }).compile();

    service = module.get<CityService>(CityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when no IP provided', () => {
    expect(() => service.getCity(null)).toThrow('No IP provided');
  });

  it('should log error when processing IP fails', () => {
    const ip = 'invalid-ip';
    expect(() => service.getCity(ip)).toThrow();
  });

  it('should return city information when IP provided', () => {
    const ip = '8.8.8.8';
    const mockCityInfo = {
      continent: {
        code: 'NA',
        geonameId: 6255149,
        names: {
          de: 'Nordamerika',
          en: 'North America',
          es: 'Norteamérica',
          fr: 'Amérique du Nord',
          ja: '北アメリカ',
          'pt-BR': 'América do Norte',
          ru: 'Северная Америка',
          'zh-CN': '北美洲',
        },
      },
      country: {
        geonameId: 6252001,
        isoCode: 'US',
        names: {
          de: 'USA',
          en: 'United States',
          es: 'Estados Unidos',
          fr: 'États Unis',
          ja: 'アメリカ',
          'pt-BR': 'EUA',
          ru: 'США',
          'zh-CN': '美国',
        },
      },
      registeredCountry: {
        geonameId: 6252001,
        isoCode: 'US',
        names: {
          de: 'USA',
          en: 'United States',
          es: 'Estados Unidos',
          fr: 'États Unis',
          ja: 'アメリカ',
          'pt-BR': 'EUA',
          ru: 'США',
          'zh-CN': '美国',
        },
        isInEuropeanUnion: false,
      },
      traits: {
        ipAddress: '8.8.8.8',
        isAnonymous: false,
        isAnonymousProxy: false,
        isAnonymousVpn: false,
        isAnycast: false,
        isHostingProvider: false,
        isLegitimateProxy: false,
        isPublicProxy: false,
        isResidentialProxy: false,
        isSatelliteProvider: false,
        isTorExitNode: false,
        network: '8.8.8.0/23',
      },
      location: {
        accuracyRadius: 1000,
        latitude: 37.751,
        longitude: -97.822,
        timeZone: 'America/Chicago',
      },
    };
    const result = service.getCity(ip);
    expect(JSON.parse(JSON.stringify(result))).toEqual(mockCityInfo);
  });
});
