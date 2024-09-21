import { Logger } from '@nestjs/common';

const logger = new Logger();

export const formatSuccessResponse = (data: any) => ({
  status: 'success',
  continent: data.continent?.names?.en ?? '',
  continentCode: data.continent?.code ?? '',
  country: data.country?.names?.en ?? '',
  countryCode: data.country?.code ?? '',
  region: data.subdivisions?.[0]?.isoCode ?? '',
  regionName: data.subdivisions?.[0]?.names?.en ?? '',
  city: data.city?.names?.en ?? '',
  zip: data.postal?.code ?? '',
  lat: data.location?.latitude ?? '',
  lon: data.location?.longitude ?? '',
  timezone: data.location?.timeZone ?? '',
  proxy: data.traits
    ? data.traits.isAnonymousProxy ??
      data.traits.isAnonymousVpn ??
      data.traits.isTorExitNode
    : '',
  hosting: data.traits?.isHostingProvider ?? '',
  query: data.traits?.ipAddress ?? '',
});

export const formatGeorevSuccessResponse = (data: any) => {
  logger.log(`GeoRev Success Response: ${JSON.stringify(data)}`);
  return {
    status: 'success',
    state: data.state_name ?? '',
    district: data.district_name ?? '',
    subDistrict: data.subdistrict_name ?? '',
  };
};

export const formatCentroidResponse = (
  data: any,
  latitude: number,
  longitude: number,
) => {
  logger.log(`Centroid Success Response: ${JSON.stringify(data)}`);
  return {
    status: 'success',
    state: data.state_name ?? '',
    district: data.district_name ?? '',
    subDistrict: data.subdistrict_name ?? '',
    city: '',
    block: '',
    village: data.village_name ?? '',
    lat: latitude,
    lon: longitude,
  };
};
