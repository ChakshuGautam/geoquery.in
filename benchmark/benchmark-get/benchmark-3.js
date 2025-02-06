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
  const res = await http.get('https://geoquery.in/city/invalid_ip');
  const expected_response = `{"message":"Error processing IP: invalid_ip, Error: ValueError"}`;

  check(res, {
    'is status 404': (r) => r.status === 404,
    'is correct response': (r) => r.body === expected_response,
  });
  sleep(1);
}
