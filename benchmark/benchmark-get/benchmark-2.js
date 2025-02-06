import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 },
    { duration: '4m', target: 200 },
    { duration: '1m', target: 0 },
  ],
};

export default async function () {
  const res = await http.get('https://geoquery.in/city/8.8.8.8');
  const expected_response = `{"status":"success","continent":"North America","continentCode":"NA","country":"United States","countryCode":"","region":"","regionName":"","city":"","zip":"","lat":37.751,"lon":-97.822,"timezone":"America/Chicago","proxy":false,"hosting":false,"query":"8.8.8.8"}`;

  check(res, {
    'is status 200': (r) => r.status === 200,
    'is correct response': (r) => r.body === expected_response,
  });
  sleep(1);
}
