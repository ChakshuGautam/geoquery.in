<h1 align="center">GeoIP-Service</h1>
<h4 align="center">Examples on how to do IP to Location Details </h4>

#### Example
See code example in the [server](./server/app.js) folder.

#### Setup Server

Run `./setup.sh`. This script will install bun and download required files to setup server
```sh
cd server
./setup.sh
```

Start Server
```sh
bun app.js
```

#### API
Works with both ipv4 and ipv6.

Get geolocation corresponding to given IP
```sh
curl https://geoip.samagra.io/city/128.101.101.101
```

Get geolocation for given `lat` & `lon`
```shell
curl https://geoip.samagra.io/georev?lat=28.7041&lon=77.1025
```

Get polygon centroid for given `STATE/DISTRICT/SUBDISTRICT` with some query
```shell
curl https://geoip.samagra.io/location/DISTRICT/centroid?query=lucknow
```

#### Notes

DB will remain updated automatically. Please create a ticket if you see some issues.


#### Contribution Guide
1. Please consider issues up from grabs.
2. It will only be assigned with a PR.