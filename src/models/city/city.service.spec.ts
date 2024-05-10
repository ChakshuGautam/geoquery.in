import { Test, TestingModule } from '@nestjs/testing';
import { CityService } from './city.service';

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
    const ip = '2401:4900:1c82:377e:bb89:dfc9:28a1:1e06';
    const mockCityInfo = {
      continent: {
        code: 'AS',
        geonameId: 6255147,
        names: {
          de: 'Asien',
          en: 'Asia',
          es: 'Asia',
          fr: 'Asie',
          ja: 'アジア',
          'pt-BR': 'Ásia',
          ru: 'Азия',
          'zh-CN': '亚洲',
        },
      },
      country: {
        geonameId: 1269750,
        isoCode: 'IN',
        names: {
          de: 'Indien',
          en: 'India',
          es: 'India',
          fr: 'Inde',
          ja: 'インド',
          'pt-BR': 'Índia',
          ru: 'Индия',
          'zh-CN': '印度',
        },
      },
      registeredCountry: {
        geonameId: 1269750,
        isoCode: 'IN',
        names: {
          de: 'Indien',
          en: 'India',
          es: 'India',
          fr: 'Inde',
          ja: 'インド',
          'pt-BR': 'Índia',
          ru: 'Индия',
          'zh-CN': '印度',
        },
        isInEuropeanUnion: false,
      },
      traits: {
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
        ipAddress: '2401:4900:1c82:377e:bb89:dfc9:28a1:1e06',
        network: '2401:4900:1c82::/48',
      },
      city: {
        geonameId: 1264733,
        names: {
          de: 'Lucknow',
          en: 'Lucknow',
          es: 'Lucknow',
          fr: 'Lucknow',
          ja: 'ラクナウ',
          'pt-BR': 'Lucknow',
          ru: 'Лакхнау',
          'zh-CN': '勒克瑙',
        },
      },
      location: {
        accuracyRadius: 200,
        latitude: 26.8756,
        longitude: 80.9115,
        timeZone: 'Asia/Kolkata',
      },
      postal: {
        code: '226004',
      },
      subdivisions: [
        {
          geonameId: 1253626,
          isoCode: 'UP',
          names: {
            en: 'Uttar Pradesh',
            fr: 'Uttar Pradesh',
            ja: 'ウッタル・プラデーシュ州',
            'pt-BR': 'Utar Pradexe',
            ru: 'Уттар-Прадеш',
            'zh-CN': '北方邦',
          },
        },
      ],
    };
    const result = service.getCity(ip);
    expect(JSON.parse(JSON.stringify(result))).toEqual(mockCityInfo);
  });
});
