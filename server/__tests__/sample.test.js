import { app } from '../app.js'
import Bun from 'bun';

const BASE_URL = `http://0.0.0.0:${app.port}`;

describe('GET /', () => {
  it('should return the index.html page', async () => {
    const response = await fetch(BASE_URL);
    const htmlResponse = await response.text();
    const indexPage = Bun.file(`${import.meta.dir}/../www/index.html`);
    expect(response.status).toBe(200);
    expect(htmlResponse).toEqual(await indexPage.text());
  });
});

describe('GET /city/:ip', () => {
  it('should return geolocation data for a valid IP', async () => {
    const response = await fetch(`${BASE_URL}/city/8.8.8.8`); // Replace with a valid IP address
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      status: "success",
      continent: "North America",
      continentCode: "NA",
      country: "United States",
      countryCode: "",
      region: "",
      regionName: "",
      city: "",
      zip: "",
      lat: 37.751,
      lon: -97.822,
      timezone: "America/Chicago",
      proxy: false,
      hosting: false,
      query: "8.8.8.8",
    });
  });

  it('should return an error for an invalid IP', async () => {
    const response = await fetch(`${BASE_URL}/city/invalid_ip`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(200); // Handle error gracefully in your app, so it returns 200 status
    expect(jsonResponse).toEqual({
      status: 'fail',
      message: 'ValueError',
      query: 'invalid_ip'
    });
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
    expect(jsonResponse).toEqual([
      {
        status: "success",
        continent: "North America",
        continentCode: "NA",
        country: "United States",
        countryCode: "",
        region: "",
        regionName: "",
        city: "",
        zip: "",
        lat: 37.751,
        lon: -97.822,
        timezone: "America/Chicago",
        proxy: false,
        hosting: false,
        query: "8.8.8.8",
      }, {
        status: "success",
        continent: "North America",
        continentCode: "NA",
        country: "United States",
        countryCode: "",
        region: "IL",
        regionName: "Illinois",
        city: "Geneva",
        zip: "60134",
        lat: 41.8847,
        lon: -88.3028,
        timezone: "America/Chicago",
        proxy: false,
        hosting: false,
        query: "4.4.4.4",
      }
    ]);
  });

  it('should handle errors when processing IP addresses', async () => {
    const response = await fetch(`${BASE_URL}/city/batch`, {
      method: 'POST',
      body: JSON.stringify(['8.8.8.8', 'invalid_id']),  // Replace with valid IP addresses
      headers: { "Content-Type": "application/json" },
    });
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse[0]).toEqual({
      status: "success",
      continent: "North America",
      continentCode: "NA",
      country: "United States",
      countryCode: "",
      region: "",
      regionName: "",
      city: "",
      zip: "",
      lat: 37.751,
      lon: -97.822,
      timezone: "America/Chicago",
      proxy: false,
      hosting: false,
      query: "8.8.8.8",
    });
    expect(jsonResponse[1]).toEqual({
      status: "fail",
      message: "ValueError",
      query: "invalid_id",
    });
  });
});

describe('GET /georev', () => {
  it('returns location data for valid coordinates', async () => {
    const latitude = '26.8756';  // Use a valid latitude
    const longitude = '80.9115'; // Use a valid longitude
    const response = await fetch(`${BASE_URL}/georev?lat=${latitude}&lon=${longitude}`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      status: "success",
      state: "UTTAR PRADESH",
      district: "Lucknow",
      subDistrict: "Lucknow",
    });
  });

  it('returns an error for invalid coordinates', async () => {
    const latitude = 'invalid_lat';  // Invalid latitude
    const longitude = 'invalid_lon'; // Invalid longitude
    const response = await fetch(`${BASE_URL}/georev?lat=${latitude}&lon=${longitude}`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({
      status: "fail",
      error: "coordinates must contain numbers",
    });
  });
});

describe('GET /location/:locationlevel/centroid', () => {
  it ('should return lat lon for given district name in query', async() => {
    const response = await fetch(`${BASE_URL}/location/DISTRICT/centroid?query=lucknow`);
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      status: "success",
      state: "UTTAR PRADESH",
      district: "Lucknow",
      subDistrict: "",
      city: "",
      block: "",
      village: "",
      lat: 26.830190863213858,
      lon: 80.89119983155268,
    });
  })

  it ('should return error for invalid district name in query', async() => {
    const response = await fetch(`${BASE_URL}/location/DISTRICT/centroid?query=lalaland`);
    expect(response.status).toBe(404);
  })
});