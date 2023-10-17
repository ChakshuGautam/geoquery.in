import { Reader } from '@maxmind/geoip2-node';
import { Router } from '@stricjs/router';
import * as fs from 'fs';
import Bun from 'bun';

const buffer = fs.readFileSync('./db.mmdb');
const reader = Reader.openBuffer(buffer);


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
      zip:data.postal ? data.postal.code : '',
      lat: data.location && data.location.latitude ? data.location.latitude : '',
      lon: data.location && data.location.longitude ? data.location.longitude : '',
      timezone: data.location && data.location.timeZone ? data.location.timeZone : '',
      proxy: data.traits ? (data.traits.isAnonymousProxy || data.traits.isAnonymousVpn || data.traits.isTorExitNode) : '',
      hosting: data.traits ? data.traits.isHostingProvider : '',
      query: data.traits && data.traits.ipAddress ? data.traits.ipAddress : ''
  };
};

// format the error response data
const formatErrorResponse = (error,ip) => {
  return {
    status:"fail",
    message:error.name,
    query:ip
  }
}

const app = new Router()
  .get('/', () => new Response(Bun.file(__dirname + '/www/index.html')))
  .get('/city/:ip', (ctx) => {
    try {
      const resp = reader.city(ctx.params.ip);
      return Response.json(formatSuccessResponse(resp));
    } catch (error) {
      return Response.json(formatErrorResponse(error,ctx.params.ip));
    }
  })
  .post('/city/batch', async (req) => {
    try {
      const { ips } = await req.json();  // Extract the 'ips' array from the request body
  
      // Create an array of promises, each promise resolves to the city corresponding to the IP address
      const promises = ips.map(async (ip) => {
        let response;
        try {
           response = reader.city(ip);
           return formatSuccessResponse(response);
        } catch (error) {
          return formatErrorResponse(error,ip);
        } 
      });
      // Wait for all promises to settle and collect the results
      const results = await Promise.all(promises);
  
      return Response.json(results, { status: 200 });
    } catch (error) {
      return new Response('Error processing IP addresses', { status: 500 });
    }
  });

app.use(404, () => {
  return new Response(Bun.file(__dirname + '/www/404.html'))
});

app.port = (process.env.PORT || 3000);
app.hostname = '0.0.0.0';

app.listen();
