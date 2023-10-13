// import fs from 'fs';
// import * as mmdb from 'mmdb-lib';

// // Get a buffer with mmdb database, from file system or whereever.
// const db = fs.readFileSync('/Users/chakshugautam/Experiments/mmdb/GeoLite2-City-2023-10-13.mmdb');

// const reader = new mmdb.Reader < CityResponse > (db);
// console.log(reader.get('66.6.44.4')); // inferred type `CityResponse`
// console.log(reader.getWithPrefixLength('66.6.44.4')); // tuple with inferred type `[CityResponse|null, number]`


var mmdbreader = require('maxmind-db-reader');
// open database
mmdbreader.open('./test.mmdb', function (err, countries) {
    // get geodata
    countries.getGeoData('2402:e280:3e09:eef:a9a7:a769:77d8:6c50', function (err, geodata) {
        // log data :D
        console.log(geodata);
    });
});