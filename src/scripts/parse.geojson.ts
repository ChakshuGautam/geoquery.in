import * as fs from 'fs';
import { Logger } from '@nestjs/common';

const logger = new Logger('parse.geojson.ts');
const geoJsonFilesPath = `${__dirname}/../geojson-data`;

interface LocationProperty {
  STNAME?: string;
  dtname?: string;
  sdtname?: string;
  DISTRICT?: string;
  STATE?: string;
  SUB_DIST?: string;
  NAME?: string;
}

logger.debug('Parsing INDIA_STATE');
const INDIA_STATE = JSON.parse(
  fs.readFileSync(`${geoJsonFilesPath}/INDIA_STATE.geojson`, 'utf8'),
);
let featuresLength = INDIA_STATE.features.length;
for (let i = 0; i < featuresLength; i++) {
  const locationProperty: LocationProperty = INDIA_STATE.features[i].properties;
  INDIA_STATE.features[i].properties = {
    stname: locationProperty?.STNAME,
    levelLocationName: locationProperty?.STNAME,
    ...locationProperty,
  };
}
fs.writeFileSync(
  `${geoJsonFilesPath}/INDIA_STATE.geojson`,
  JSON.stringify(INDIA_STATE),
);

logger.debug('Parsing INDIA_DISTRICT');
const INDIA_DISTRICT = JSON.parse(
  fs.readFileSync(`${geoJsonFilesPath}/INDIA_DISTRICT.geojson`, 'utf8'),
);
featuresLength = INDIA_DISTRICT.features.length;
for (let i = 0; i < featuresLength; i++) {
  const locationProperty: LocationProperty =
    INDIA_DISTRICT.features[i].properties;
  INDIA_DISTRICT.features[i].properties = {
    levelLocationName: locationProperty?.dtname,
    ...locationProperty,
  };
}
fs.writeFileSync(
  `${geoJsonFilesPath}/INDIA_DISTRICT.geojson`,
  JSON.stringify(INDIA_DISTRICT),
);

logger.debug('Parsing INDIA_SUBDISTRICT');
const INDIA_SUBDISTRICT = JSON.parse(
  fs.readFileSync(`${geoJsonFilesPath}/INDIA_SUBDISTRICT.geojson`, 'utf8'),
);
featuresLength = INDIA_SUBDISTRICT.features.length;
for (let i = 0; i < featuresLength; i++) {
  const locationProperty: LocationProperty =
    INDIA_SUBDISTRICT.features[i].properties;
  INDIA_SUBDISTRICT.features[i].properties = {
    levelLocationName: locationProperty?.sdtname,
    ...locationProperty,
  };
}
fs.writeFileSync(
  `${geoJsonFilesPath}/INDIA_SUBDISTRICT.geojson`,
  JSON.stringify(INDIA_SUBDISTRICT),
);

logger.debug('Parsing indian_village_boundaries geoJSONs');
const states = fs.readdirSync(`${geoJsonFilesPath}/indian_village_boundaries/`);

// Uncomment the following code block to use Nest Logger inside nested loops
// for (const state of states) {
//   logger.debug(`Parsing geoJSON(s) for state ${state}`);
//   const stateFiles = fs.readdirSync(`${geoJsonFilesPath}/indian_village_boundaries/${state}`);
//   for (const file of stateFiles) {
//     if (!file.endsWith(`.geojson`)) continue;
//     logger.debug(`Parsing ${file}`);
//     const villagesGeoJson = JSON.parse(fs.readFileSync(`${geoJsonFilesPath}/indian_village_boundaries/${state}/${file}`));
//     const geoJsonLength = villagesGeoJson.features.length;
//     for (let i = 0; i < geoJsonLength; i++) {
//       const locationProperty: LocationProperty = villagesGeoJson.features[i].properties;
//       villagesGeoJson.features[i].properties = {
//         dtName: locationProperty?.DISTRICT,
//         stName: locationProperty?.STATE,
//         sdtName: locationProperty?.SUB_DIST,
//         levelLocationName: locationProperty?.NAME,
//         ...locationProperty,
//       };
//     }
//     fs.writeFileSync(`${geoJsonFilesPath}/indian_village_boundaries/${state}/${file}`, JSON.stringify(villagesGeoJson));
//   }
// }

const masterLocationNamesJson = require(
  `${geoJsonFilesPath}/MASTER_LOCATION_NAMES.json`,
);
fs.writeFileSync(
  `${geoJsonFilesPath}/PARSED_MASTER_LOCATION_NAMES.json`,
  JSON.stringify(masterLocationNamesJson),
);

logger.debug('Parsing complete');
