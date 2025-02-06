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
  const res = await http.get('http://localhost:3000/city/invalid_ip');
  const expected_response = `{"statuscode":200,"data":[{"data":{"message":{"status":"fail","message":"ValueError","query":"invalid_ip"},"statusCode":200},"errors":[]}]}`;

  check(res, {
    'is status 200': (r) => r.status === 200,
    'is correct response': (r) => r.body === expected_response,
  });
  sleep(1);
}
