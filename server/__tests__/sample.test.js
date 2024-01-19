import { app } from '../app.js'

const BASE_URL = `http://0.0.0.0:${app.port}`;

describe('GET /', () => {
  it('should return the index.html page', async () => {
    const response = await fetch(BASE_URL);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });
});

describe('GET /city/:ip', () => {
  it('should return geolocation data for a valid IP', async () => {
    const response = await fetch(`${BASE_URL}/city/8.8.8.8`); // Replace with a valid IP address
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse.status).toBe('success');
  });

  it('should return an error for an invalid IP', async () => {
    const response = await fetch(`${BASE_URL}/city/invalid_ip`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(200); // Handle error gracefully in your app, so it returns 200 status
    expect(jsonResponse.status).toBe('fail');
  });
});

describe('POST /city/batch', () => {
  it('should return geolocation data for an array of valid IPs', async () => {
    const response = await fetch(`http://0.0.0.0:3000/city/batch`, {
      method: 'POST',
      body: JSON.stringify(['8.8.8.8', '4.4.4.4']),  // Replace with valid IP addresses
      headers: { "Content-Type": "application/json" },
    });
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(jsonResponse)).toBe(true);
  });

  it('should handle errors when processing IP addresses', async () => {
    const response = await fetch(`${BASE_URL}/city/batch`, {
      method: 'POST',
      body: JSON.stringify(['8.8.8.8', 'invalid_id']),  // Replace with valid IP addresses
      headers: { "Content-Type": "application/json" },
    });
    const jsonResponse = await response.json();
    expect(response.status).toBe(200); // Handle error gracefully in your app, so it returns 500 status
    expect(jsonResponse[1].status).toBe('fail');
  });
});

describe('GET /georev', () => {
  it('returns location data for valid coordinates', async () => {
    const latitude = '26.8756';  // Use a valid latitude
    const longitude = '80.9115'; // Use a valid longitude
    const response = await fetch(`/georev?lat=${latitude}&lon=${longitude}`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toHaveProperty('status', 'success');
  });

  it('returns an error for invalid coordinates', async () => {
    const latitude = 'invalid_lat';  // Invalid latitude
    const longitude = 'invalid_lon'; // Invalid longitude
    const response = await fetch(`/georev?lat=${latitude}&lon=${longitude}`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toHaveProperty('status', 'fail');
  });
});

describe('POST /location/centroid', () => {
  it ('should return lat lon for given district name in query', async() => {
    const response = await fetch(`${BASE_URL}/location/centroid?district=lucknow`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      district: "Lucknow",
      state: "UTTAR PRADESH",
      lon: 80.89119983155268,
      lat: 26.830190863213858,
    });
  })

  it ('should return error for invalid district name in query', async() => {
    const response = await fetch(`${BASE_URL}/location/centroid?district=lalaland`);
    expect(response.status).toBe(404);
  })
});