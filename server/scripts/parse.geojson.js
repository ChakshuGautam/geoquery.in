import * as fs from 'fs';


const geoJsonFilesPath = `${import.meta.dir}/../geojson-data`;
let featuresLength;

console.log('Parsing INDIA_STATE');
const INDIA_STATE = JSON.parse(fs.readFileSync(`${geoJsonFilesPath}/INDIA_STATE.geojson`, 'utf8'));
featuresLength = INDIA_STATE.features.length;
for (let i = 0; i < featuresLength; i++) {
    const locationProperty = INDIA_STATE.features[i].properties;
    INDIA_STATE.features[i].properties = {
        stname: locationProperty.STNAME,
        stcode11: locationProperty.STCODE11,
        levelLocationName: locationProperty.STNAME,
        ...locationProperty
    }
}
fs.writeFileSync(`${geoJsonFilesPath}/INDIA_STATE.geojson`, JSON.stringify(INDIA_STATE));

console.log('Parsing INDIA_DISTRICT');
const INDIA_DISTRICT = JSON.parse(fs.readFileSync(`${geoJsonFilesPath}/INDIA_DISTRICT.geojson`, 'utf8'));
featuresLength = INDIA_DISTRICT.features.length;
for (let i = 0; i < featuresLength; i++) {
    const locationProperty = INDIA_DISTRICT.features[i].properties;
    INDIA_DISTRICT.features[i].properties = {
        levelLocationName: locationProperty.dtname,
        ...locationProperty
    }
}
fs.writeFileSync(`${geoJsonFilesPath}/INDIA_DISTRICT.geojson`, JSON.stringify(INDIA_DISTRICT));

console.log('Parsing INDIA_SUBDISTRICT');
const INDIA_SUBDISTRICT = JSON.parse(fs.readFileSync(`${geoJsonFilesPath}/INDIA_SUBDISTRICT.geojson`, 'utf8'));
featuresLength = INDIA_SUBDISTRICT.features.length;
for (let i = 0; i < featuresLength; i++) {
    const locationProperty = INDIA_SUBDISTRICT.features[i].properties;
    INDIA_SUBDISTRICT.features[i].properties = {
        levelLocationName: locationProperty.sdtname,
        ...locationProperty
    }
}
fs.writeFileSync(`${geoJsonFilesPath}/INDIA_SUBDISTRICT.geojson`, JSON.stringify(INDIA_SUBDISTRICT));
