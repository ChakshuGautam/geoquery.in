import {Reader} from '@maxmind/geoip2-node';
import * as turf from '@turf/turf'
import {Router} from '@stricjs/router';
import * as fs from 'fs';
import Bun from 'bun';
import express from 'express';
import swagger from './util/swagger';
import config from './config.json';
import Logger from './util/logger';

const buffer = fs.readFileSync(`${import.meta.dir}/db.mmdb`);
const reader = Reader.openBuffer(buffer);

const swaggerApp = express();

swagger(swaggerApp);

const GeoLocationLevel = {
  VILLAGE: 'VILLAGE',
  SUBDISTRICT: 'SUBDISTRICT',
  DISTRICT: 'DISTRICT',
  STATE: 'STATE'
}

// Check if required geojson files exists
const geoJsonFilesPath = `${import.meta.dir}/geojson-data`;
fs.readdir(geoJsonFilesPath, (err, files) => {
  if (err) {
    Logger.error('app.js',`Error reading folder: ${err}`);
    process.exit();
  }

  for (const locationLevel of config.requiredGeoLocationLevels) {
    const geoJsonFileName = `${config.country}_${locationLevel}.geojson`;
    if (!files.includes(geoJsonFileName)) {
      Logger.error('app.js',`Required GeoJson file: ${geoJsonFileName} not present`);
      process.exit();
    }
  }
});

const geoJsonFiles = {};
for (const locationLevel of config.requiredGeoLocationLevels) {
  const geoJsonFileName = `${config.country}_${locationLevel}`;
  geoJsonFiles[geoJsonFileName] = JSON.parse(fs.readFileSync(`${geoJsonFilesPath}/${geoJsonFileName}.geojson`, 'utf8'));
  Logger.info('app.js',`Loaded GeoJson file: ${geoJsonFileName}`);
}

// format the success response data
const formatSuccessResponse = (data) => {
  return {
    status: 'success',
    continent: data.continent && data.continent.names ? data.continent.names.en : '',
    continentCode: data.continent && data.continent.code ? data.continent.code : '',
    country: data.country && data.country.names ? data.country.names.en : '',
    countryCode: data.country && data.country.code ? data.country.code : '',
    region: data.subdivisions && data.subdivisions[0] ? data.subdivisions[0].isoCode : '',
    regionName: data.subdivisions && data.subdivisions[0] && data.subdivisions[0].names ? data.subdivisions[0].names.en : '',
    city: data.city && data.city.names ? data.city.names.en : '',
    zip: data.postal ? data.postal.code : '',
    lat: data.location && data.location.latitude ? data.location.latitude : '',
    lon: data.location && data.location.longitude ? data.location.longitude : '',
    timezone: data.location && data.location.timeZone ? data.location.timeZone : '',
    proxy: data.traits ? (data.traits.isAnonymousProxy || data.traits.isAnonymousVpn || data.traits.isTorExitNode) : '',
    hosting: data.traits ? data.traits.isHostingProvider : '',
    query: data.traits && data.traits.ipAddress ? data.traits.ipAddress : ''
  };
};

// format the georev success response
const formatGeorevSuccessResponse = (data) => {
  Logger.info('app.js',`GeoRev Success Response: ${JSON.stringify(data)}`);
  return {
    status: 'success',
    state: data.stname ? data.stname : '',
    district: data.dtname ? data.dtname : '',
    subDistrict: data.sdtname ? data.sdtname : ''
  }
};

// format the error response data
const formatErrorResponse = (error, ip) => {
  Logger.error('app.js',`Error processing IP: ${ip}, Error: ${error.name}`);
  return {
    status: "fail",
    message: error.name,
    query: ip
  }
}

const formatCentroidResponse = (data, latitude, longitude) => {
  Logger.info('app.js',`Centroid Success Response: ${JSON.stringify(data)}`);
  return {
    status: 'success',
    state: data.stname ? data.stname : '',
    district: data.dtname ? data.dtname : '',
    subDistrict: data.sdtname ? data.sdtname : '',
    city: '',
    block: '',
    village: '',
    lat: latitude,
    lon: longitude
  }
}

function isPointInMultiPolygon(multiPolygon, point) {
  Logger.info('app.js',`Checking if point is in MultiPolygon`);
  return multiPolygon.geometry.coordinates.some(polygonCoordinates => {
    const poly = turf.polygon(polygonCoordinates);
    return turf.booleanContains(poly, point);
  });
}

function individualQuery(country, geoLocationLevel, coordinates) {
  const pointToSearch = turf.point(coordinates);
  for (let feature of geoJsonFiles[`${country}_${geoLocationLevel}`].features) {
    if (feature.geometry.type === 'Polygon') {
      Logger.info('app.js',`Checking if point is in Polygon`);
      let poly = turf.polygon(feature.geometry.coordinates, feature.properties);
      if (turf.booleanContains(poly, pointToSearch)) {
        Logger.info('app.js',`Point is in Polygon`);
        return poly.properties;
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      Logger.info('app.js',`Checking if point is in MultiPolygon`);
      if (isPointInMultiPolygon(feature, pointToSearch)) {
        Logger.info('app.js',`Point is in MultiPolygon`);
        return feature.properties;
      }
    }
  }
}

export const app = new Router()
  .get('/', () => new Response(Bun.file(__dirname + '/www/index.html')))
  .get('/city/:ip', (ctx) => {
    try {
      const resp = reader.city(ctx.params.ip);
      Logger.info('app.js',`City Success Response: ${JSON.stringify(resp)}`);
      return Response.json(formatSuccessResponse(resp));
    } catch (error) {
      Logger.error('app.js',`Error processing IP: ${ctx.params.ip}, Error: ${error.name}`);
      return Response.json(formatErrorResponse(error,ctx.params.ip));
    }
  })
  .post('/city/batch', async (req) => {
    try {
      Logger.info('app.js',`Batch City Request: ${JSON.stringify(req)}`);
      const ips = await req.json();  // Extract the 'ips' array from the request body
      // Create an array of promises, each promise resolves to the city corresponding to the IP address
      const promises = ips.map(async (ip) => {
        let response;
        try {
           response = reader.city(ip);
           Logger.info('app.js',`City Success Response: ${JSON.stringify(response)}`);
           return formatSuccessResponse(response);
        } catch (error) {
          Logger.error('app.js',`Error processing IP: ${ip}, Error: ${error.name}`);
          return formatErrorResponse(error,ip);
        } 
      });
      // Wait for all promises to settle and collect the results
      const results = await Promise.all(promises);
      Logger.info('app.js',`Batch City Success Response: ${JSON.stringify(results)}`);
      return Response.json(results, { status: 200 });
    } catch (error) {
      Logger.error('app.js',`Error processing IP addresses: ${error.name}`);
      return new Response('Error processing IP addresses', { status: 500 });
    }
  })
  .get('/georev', (ctx) => {
    try {
      let url = new URL(ctx.url);
      let latitude = url.searchParams.get('lat');
      let longitude = url.searchParams.get('lon');
      if (!latitude || !longitude) {
        Logger.error('app.js',`lat lon query missing`);
        return Response.json({
          status: 'fail',
          error: `lat lon query missing`
        }, { status: 400 });
      }
      // Searching for SUBDISTRICT GeoLocation Level
      let resp = individualQuery(config.country, GeoLocationLevel.SUBDISTRICT, [longitude, latitude])
      if (!resp) {
        Logger.error('app.js',`No GeoLocation found for lat: ${latitude}, lon ${longitude}`);
        return Response.json({
          status: "fail",
          error: `No GeoLocation found for lat: ${latitude}, lon ${longitude}`
        }, { status: 404 });
      }
      Logger.info('app.js',`GeoRev Success Response: ${JSON.stringify(resp)}`);
      return Response.json(formatGeorevSuccessResponse(resp));
    } catch (error) {
      Logger.error('app.js',`Error processing lat lon: ${error.name}`);
      return Response.json({
        status: "fail",
        error: error.message
      }, { status: 500 })
    }
  })
  .get('/location/:locationlevel/centroid', async (ctx) => {
    try {
      let url = new URL(ctx.url);
      const locationLevel = ctx.params.locationlevel;
      if (!Object.keys(GeoLocationLevel).includes(locationLevel)) {
        Logger.error('app.js',`Unsupported GeoLocation Level: ${locationLevel}`);
        return Response.json({
          status: 'fail',
          error: `Unsupported GeoLocation Level: ${locationLevel}`
        }, { status: 400});
      }
      let query = url.searchParams.get('query');
      if (!query) {
        Logger.error('app.js',`No ${locationLevel} query found`);
        return Response.json({
          status: 'fail',
          error: `No ${locationLevel} query found`
        }, { status: 400 });
      }
      let queryFeature;
      for (const feature of geoJsonFiles[`${config.country}_${locationLevel}`].features) {
        if (feature.properties.levelLocationName.toLowerCase() === query.toLowerCase()) {
          queryFeature = feature;
        }
      }
      if (!queryFeature) {
        Logger.error('app.js',`No ${locationLevel} found with name: ${query}`);
        return Response.json({
          status: 'fail',
          error: `No ${locationLevel} found with name: ${query}`
        }, { status: 404 });
      }
      let polygonFeature;
      if (queryFeature.geometry.type === 'Polygon') {
        polygonFeature = turf.polygon(queryFeature.geometry.coordinates);
      } else {
        polygonFeature = turf.multiPolygon(queryFeature.geometry.coordinates);
      }
      const centroid = turf.centroid(polygonFeature);
      const longitude = centroid.geometry.coordinates[0];
      const latitude = centroid.geometry.coordinates[1];
      Logger.info('app.js',`Centroid Success Response: ${JSON.stringify(queryFeature.properties)}`);
      return Response.json(formatCentroidResponse(queryFeature.properties, latitude, longitude), { status : 200 }) 
    } catch (error) {
      Logger.error('app.js',`Error processing ${locationLevel} query: ${error.name}`);
      return Response.json({ 
        status: 'fail',
        error: error.name 
      }, { status: 500 });
    }
  });

app.use(404, () => {
  Logger.error('app.js',`404 Not Found`);
  return new Response(Bun.file(import.meta.dir + '/www/404.html'))
});

app.port = (process.env.PORT || 3000);
app.hostname = '0.0.0.0';


swaggerApp.listen(3001, () => logger.info('app.js','Swagger listening on port 3000'));
app.listen();
