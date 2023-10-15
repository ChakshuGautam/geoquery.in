import { Reader } from '@maxmind/geoip2-node';
import { Router } from '@stricjs/router';
import * as fs from 'fs';
import Bun from 'bun';

const buffer = fs.readFileSync('./db.mmdb');
const reader = Reader.openBuffer(buffer);

const app = new Router()
  .get('/', () => new Response(Bun.file(__dirname + '/www/index.html')))
  .get('/city/:ip', (ctx) => {
    const resp = reader.city(ctx.params.ip);
    return Response.json(resp);
  });

app.use(404, () => {
  return new Response(Bun.file(__dirname + '/www/404.html'))
});

app.port = (process.env.PORT || 3000);
app.hostname = '0.0.0.0';

app.listen();
