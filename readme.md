<h1 align="center">GeoIP-Service</h1>
<h4 align="center">Examples on how to do IP to Location Details </h4>

#### Example
See code example in the [server](./server/app.js) folder.

#### Setup Server

Make sure you have [`bun`](https://bun.sh/) installed.
```sh
curl -fsSL https://bun.sh/install | bash
```

Install/Build
```sh
bun install
```

Start Server
```sh
cd server
bun app.js
```

#### API
Works with both ipv4 and ipv6.

```sh
curl https://geoip.samagra.io/city/128.101.101.101
```
```shell
curl https://geoip.samagra.io/georev?lat=28.7041&lon=77.1025
```

#### Notes

DB will remain updated automatically. Please create a ticket if you see some issues.


#### Contribution Guide
1. Please consider issues up from grabs.
2. It will only be assigned with a PR.
