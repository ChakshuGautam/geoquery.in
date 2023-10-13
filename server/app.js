import express from 'express';
import { Reader } from '@maxmind/geoip2-node';
import * as fs from 'fs';
const buffer = fs.readFileSync('./db.mmdb');
const reader = Reader.openBuffer(buffer);

const app = express();

app.use(express.static('www'));

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/www/index.html');  // Always serve index.html
});

app.get('/city/:ip', (req, res) => {
    const city = reader.city(req.params.ip);
    res.send(city);
})

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});