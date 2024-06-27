<h1 align="center">GeoQuery.in</h1>
<h4 align="center">Open Mapping Infrastructure</h4>

### Vision
Our [vision](./vision.md).

### Example
See code example in the [server](./src/main.ts) folder.

### Setup Server
Run `./setup.sh`. This script will download all the necessary files 
```sh
./setup.sh
```

Install Dependencies
```sh
npm i
```

Start Server
```sh
npm run start
```

### Docker Container Setup and Usage Guide

This guide provides instructions for using the Docker container to deploy and interact with the application. The Docker container contains an application that provides location information based on district centroids.

#### Prerequisites

Before getting started, ensure that you have Docker installed on your system. Refer to the [Docker installation documentation](https://docs.docker.com/get-docker/) for installation instructions based on your operating system.

#### Setup Docker Container

Once Docker is installed, follow the steps below to set up and run the Docker container:

1. Clone the repository containing the Dockerfile and application files.
    ```bash
    git clone https://github.com/ChakshuGautam/geoquery.in
    ```
   
2. Build the Docker image using the provided Dockerfile with the following command:

   ```bash
   docker build . -t geoquery
   ```
   > Note: After adding your user to the Docker group, you can run Docker commands without using `sudo`. If you haven't added your user to the Docker group, remember to use `sudo` before Docker commands.

3. Run the Docker container using the following command:

   ```bash
   docker run -d geoquery
   ```

This command will start the Docker container in detached mode, allowing you to interact with the application.

#### Interacting with the Application

Once the Docker container is running, you can interact with the application using the provided commands.

1. Check Docker Container Status

    To check the status of the Docker container, use the following command:
    
    ```bash
    docker ps
    ```
    
    This command will display a list of running Docker containers along with their details. Store "Container ID"

2. Retrieve Container IP Address

    To retrieve the IP address of the Docker container, use the following command:
    
    ```bash
    docker inspect <container_id> | grep -i "ipaddress" | grep -o '"IPAddress": "[^"]*' | grep -o '[^"]*$' | head -n1
    ```
    
    Replace `<container_id>` with the ID of the running Docker container.

3. Access Application Endpoint

    To access the application endpoint and retrieve location information, use the following command:
    
    ```bash
    curl "http://<container_ip_address>:3000/location/DISTRICT/centroid?query=<location_query>"
    ```
    
    Replace `<container_ip_address>` with the IP address of the Docker container obtained in the previous step, and `<location_query>` with the desired location query.
    
    Example:
    
    ```bash
    curl "http://172.17.0.2:3000/location/DISTRICT/centroid?query=lucknow"
    ```
    > Here we have replaced `<container_ip_address>` with the actual IP address we obtained.
    This command will retrieve information about the centroid of the district "Lucknow".


### API
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

Fuzzy search location by name with `STATE/DISTRICT/SUBDISTRICT/VILLAGE` levels with query & location level filters in request body, `filter` keys should one of these `STATE/DISTRICT/SUBDISTRICT/VILLAGE`.
```shell
curl --location 'https://geoip.samagra.io/location/VILLAGE/fuzzysearch' \
--header 'Content-Type: application/json' \
--data '{
    "query": "Arong",
    "filter": {
        "STATE": "Andaman & Nicobar Islands",
        "DISTRICT": "Nicobars"
    }
}'
# Response
{
    "matches": [
        {
            "state": "Andaman & Nicobar Islands",
            "district": "Nicobars",
            "subDistrict": "Car Nicobar",
            "village": "Arong"
        }
    ]
}
```
### Notes

DB will remain updated automatically. Please create a ticket if you see some issues.


### Contribution Guide
1. Please consider issues up from grabs.
2. It will only be assigned with a PR.
