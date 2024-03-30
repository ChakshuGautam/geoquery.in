mkdir ./src/geojson-data &> /dev/null
cd ./src/geojson-data

curl -Lo INDIA_DISTRICT.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIA_DISTRICTS.geojson"
curl -Lo INDIA_SUBDISTRICT.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIAN_SUB_DISTRICTS.geojson"
curl -Lo INDIA_STATE.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIA_STATES.geojson"

# This JSON contains state > districts > subDistricts > villages for all states
curl -Lo MASTER_LOCATION_NAMES.json "https://github.com/pranshumaheshwari/indian-cities-and-villages/raw/master/data.json"

# village boundary
git clone https://github.com/datameet/indian_village_boundaries.git
# indian_village_boundaries repo cleanup
cd indian_village_boundaries
rm -rf .git docs website CONTRIBUTING.md LICENSE README.md
# Renaming states dir
mv ./br ./bihar
mv ./ga ./goa
mv ./gj ./gujarat
mv ./ka ./karnataka
mv ./kl ./kerala
mv ./mh ./maharashtra
mv ./or ./odisha
mv ./rj ./rajasthan
mv ./sk ./sikkim

# Changing PWD back to /server/
cd ../..

# Updating geoJSON files through script to make them usable in server
cd ./scripts
npx ts-node parse.geojson.ts

# Changing PWD back to /server/
cd - &> /dev/null