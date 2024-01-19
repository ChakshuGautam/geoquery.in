import request from 'supertest';
import app from '../app.js';

describe('GET /', () => {
  it('should return the index.html page', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });
});

describe('GET /city/:ip', () => {
  it('should return geolocation data for a valid IP', async () => {
    const response = await request(app).get('/city/8.8.8.8'); // Replace with a valid IP address
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should return an error for an invalid IP', async () => {
    const response = await request(app).get('/city/invalid_ip');
    expect(response.status).toBe(200); // Handle error gracefully in your app, so it returns 200 status
    expect(response.body.status).toBe('fail');
  });
});

describe('POST /city/batch', () => {
  it('should return geolocation data for an array of valid IPs', async () => {
    const ips = ['8.8.8.8', '4.4.4.4']; // Replace with valid IP addresses
    const response = await request(app)
      .post('/city/batch')
      .send({ ips });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should handle errors when processing IP addresses', async () => {
    const ips = ['8.8.8.8', 'invalid_ip']; // Include an invalid IP
    const response = await request(app)
      .post('/city/batch')
      .send({ ips });
    expect(response.status).toBe(500); // Handle error gracefully in your app, so it returns 500 status
  });
});

describe('GET /georev', () => {
  // Test with valid latitude and longitude
  it('returns location data for valid coordinates', async () => {
    const latitude = '26.8756';  // Use a valid latitude
    const longitude = '80.9115'; // Use a valid longitude
    const response = await request(app).get(`/georev?lat=${latitude}&lon=${longitude}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });

  // Test with invalid latitude and longitude
  it('returns an error for invalid coordinates', async () => {
    const latitude = 'invalid_lat';  // Invalid latitude
    const longitude = 'invalid_lon'; // Invalid longitude
    const response = await request(app).get(`/georev?lat=${latitude}&lon=${longitude}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'fail');
  });
});