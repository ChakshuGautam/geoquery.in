<h1 align="center">GeoIP-JS</h1>
<h2 align="center">Examples on how to do IP to Geolocation </h2>
<div align="center">

#### Example
```js
    var mmdbreader = require('maxmind-db-reader');
    // open database
    mmdbreader.open('./test.mmdb', function (err, countries) {
        // get geodata
        countries.getGeoData('2402:e280:3e09:eef:a9a7:a769:77d8:6c50', function (err, geodata) {
            // log data :D
            console.log(geodata);
        });
    });
```
