import { Reader } from '@maxmind/geoip2-node';
import { Router } from '@stricjs/router';
import * as fs from 'fs';
import Bun from 'bun';

const buffer = fs.readFileSync('./db.mmdb');
const reader = Reader.openBuffer(buffer);

const app = new Router()
  .get('/', () => new Response(Bun.file(__dirname + '/www/index.html')))

app.post('/city/batch', async (req) => {
  try {
    const { ips } = await req.json();  // Extract the 'ips' array from the request body

    // Create an array of promises, each promise resolves to the city corresponding to the IP address
    const promises = ips.map(async (ip) => {
      return reader.city(ip);
    });
    // Wait for all promises to settle and collect the results
    const results = await Promise.all(promises);

    return new Response(JSON.stringify(results));
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
