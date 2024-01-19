import {Reader} from '@maxmind/geoip2-node';
// var geojsonRbush = require('geojson-rbush').default;
import {default as geojsonRbush} from 'geojson-rbush';
import * as turf from '@turf/turf'
import {Router} from '@stricjs/router';
import * as fs from 'fs';
import Bun from 'bun';
import express from 'express';
import swagger from './util/swagger';

const buffer = fs.readFileSync('./db.mmdb');
const reader = Reader.openBuffer(buffer);

const swaggerApp = express();

swagger(swaggerApp);

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
  return {
    status: 'success',
    state: data.stname ? data.stname : '',
    district: data.dtname ? data.dtname : '',
    subDistrict: data.sdtname ? data.sdtname : ''
  }
};

// format the error response data
const formatErrorResponse = (error, ip) => {
  return {
    status: "fail",
    message: error.name,
    query: ip
  }
}

function isPointInMultiPolygon(multiPolygon, point) {
  return multiPolygon.geometry.coordinates.some(polygonCoordinates => {
    const poly = turf.polygon(polygonCoordinates);
    return turf.booleanContains(poly, point);
  });
}

function individualQuery(geoJSONPaths, coordinates) {
  for (let path of geoJSONPaths) {
    const geoJSON = JSON.parse(fs.readFileSync(path, 'utf8'));
    const turf_point = turf.point(coordinates);

    for (let feature of geoJSON.features) {
      if (feature.geometry.type === 'Polygon') {
        let poly = turf.polygon(feature.geometry.coordinates, feature.properties);
        if (turf.booleanContains(poly, turf_point)) {
          return poly.properties;
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        if (isPointInMultiPolygon(feature, turf_point)) {
          return feature.properties;
        }
      }
    }
  }
}

const app = new Router()
    .get('/', () => new Response(Bun.file(__dirname + '/www/index.html')))
    .get('/city/:ip', (ctx) => {
      try {
        const resp = reader.city(ctx.params.ip);
        return Response.json(formatSuccessResponse(resp));
      } catch (error) {
        return Response.json(formatErrorResponse(error, ctx.params.ip));
      }
    })
    .post('/city/batch', async (req) => {
      try {
        const {ips} = await req.json();  // Extract the 'ips' array from the request body

        // Create an array of promises, each promise resolves to the city corresponding to the IP address
        const promises = ips.map(async (ip) => {
          let response;
          try {
            response = reader.city(ip);
            return formatSuccessResponse(response);
          } catch (error) {
            return formatErrorResponse(error, ip);
          }
        });
        // Wait for all promises to settle and collect the results
        const results = await Promise.all(promises);

        return Response.json(results, {status: 200});
      } catch (error) {
        return new Response('Error processing IP addresses', {status: 500});
      }
    })
    .get('/georev', (ctx) => {
      try {
        let url = new URL(ctx.url);
        let latitude = url.searchParams.get('lat');
        let longitude = url.searchParams.get('lon');
        let resp = individualQuery(['/path/to/geojson/file'], [longitude, latitude])
        return Response.json(formatGeorevSuccessResponse(resp));
      } catch (error) {
        return Response.json({
          status: "fail",
          error: error.name
        })
      }
    });

app.use(404, () => {
  return new Response(Bun.file(__dirname + '/www/404.html'))
});

app.port = (process.env.PORT || 3000);
app.hostname = '0.0.0.0';


swaggerApp.listen(3001, () => console.log('Swagger listening on port 3000'))
app.listen();

export default app;