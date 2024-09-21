import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / should return the index.html page', async () => {
    const response = await request(app.getHttpServer()).get('/');
    // const indexPage = readFileSync(join(__dirname, '../www/index.html'), 'utf-8');
    expect(response.status).toBe(200);
    expect(response.text).toEqual('Hello World!');
  });

  it('GET /city/:ip should return geolocation data for a valid IP', async () => {
    const response = await request(app.getHttpServer()).get('/city/8.8.8.8');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      continent: 'North America',
      continentCode: 'NA',
      country: 'United States',
      countryCode: '',
      region: '',
      regionName: '',
      city: '',
      zip: '',
      lat: 37.751,
      lon: -97.822,
      timezone: 'America/Chicago',
      proxy: false,
      hosting: false,
      query: '8.8.8.8',
    });
  });

  it('GET /city/:ip should return an error for an invalid IP', async () => {
    const response = await request(app.getHttpServer()).get('/city/invalid_ip');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'ValueError',
      query: 'invalid_ip',
    });
  });

  it('POST /city/batch should return geolocation data for an array of valid IPs', async () => {
    const response = await request(app.getHttpServer())
      .post('/city/batch')
      .send(['8.8.8.8', '8.8.8.8'])
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        status: 'success',
        continent: 'North America',
        continentCode: 'NA',
        country: 'United States',
        countryCode: '',
        region: '',
        regionName: '',
        city: '',
        zip: '',
        lat: 37.751,
        lon: -97.822,
        timezone: 'America/Chicago',
        proxy: false,
        hosting: false,
        query: '8.8.8.8',
      },
      {
        status: 'success',
        continent: 'North America',
        continentCode: 'NA',
        country: 'United States',
        countryCode: '',
        region: '',
        regionName: '',
        city: '',
        zip: '',
        lat: 37.751,
        lon: -97.822,
        timezone: 'America/Chicago',
        proxy: false,
        hosting: false,
        query: '8.8.8.8',
      },
    ]);
  });

  it('POST /city/batch should handle errors when processing IP addresses', async () => {
    const response = await request(app.getHttpServer())
      .post('/city/batch')
      .send(['8.8.8.8', 'invalid_id'])
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body[0]).toEqual({
      status: 'success',
      continent: 'North America',
      continentCode: 'NA',
      country: 'United States',
      countryCode: '',
      region: '',
      regionName: '',
      city: '',
      zip: '',
      lat: 37.751,
      lon: -97.822,
      timezone: 'America/Chicago',
      proxy: false,
      hosting: false,
      query: '8.8.8.8',
    });
    expect(response.body[1]).toEqual({
      status: 'fail',
      message: 'ValueError',
      query: 'invalid_id',
    });
  });

  it('GET /georev should return location data for valid coordinates', async () => {
    const latitude = '26.8756';
    const longitude = '80.9115';
    const response = await request(app.getHttpServer()).get(
      `/georev?lat=${latitude}&lon=${longitude}`,
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      state: 'UTTAR PRADESH',
      district: 'Lucknow',
      subDistrict: 'Lucknow',
    });
  });

  it('GET /georev should return an error for invalid coordinates', async () => {
    const latitude = 'invalid_lat';
    const longitude = 'invalid_lon';
    const response = await request(app.getHttpServer()).get(
      `/georev?lat=${latitude}&lon=${longitude}`,
    );
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'fail',
      error: 'Invalid latitude or longitude',
    });
  });

  it('GET /location/:locationlevel/centroid should return lat lon for given district name in query', async () => {
    const response = await request(app.getHttpServer()).get(
      '/location/DISTRICT/centroid?query=lucknow',
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      state: '',
      district: 'Lucknow',
      subDistrict: '',
      city: '',
      block: '',
      village: '',
      lat: 26.841984034,
      lon: 80.905485485,
    });
  });

  it('GET /location/:locationlevel/centroid should return error for invalid district name in query', async () => {
    const response = await request(app.getHttpServer()).get(
      '/location/DISTRICT/centroid?query=lalaland',
    );
    expect(response.status).toBe(404);
  });


});
