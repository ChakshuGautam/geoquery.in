import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 },
    { duration: '4m', target: 200 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://geoquery.in/');
  const expected_response = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP to City</title>
</head>

<body>
    <h3>IP to City</h3>
</body>

</html>`;

  check(res, {
    'is status 200': (r) => r.status === 200,
    'is correct response': (r) => r.body === expected_response,
  });
  sleep(1);
}
