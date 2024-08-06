import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import {
  executeDistrictCreateQuery,
  executeStateCreateQuery,
  findState,
  findDistrict,
  executeVillageCreateQuery,
  findSubDistrict, executeSubDistrictCreateQuery,
} from './service.geojson';
import * as path from 'path';

const prisma = new PrismaClient();
const villageMasterLocation = `${__dirname}/../../geojson-data/indian_village_boundaries`;

const processGeojsonFile  = async (filePath) => {
  const rawData = fs.readFileSync(filePath);
  const geojson = JSON.parse(rawData.toString());

  for (const feature of geojson.features) {
    const properties = feature.properties;
    const geoJsonData = JSON.stringify(feature.geometry);
    console.log(`Ingesting: ${properties.NAME}`, properties.STATE, properties.DISTRICT, properties.SUB_DIST);

    // Find or create the stateId based on the state code (stcode11) and state name (STATE)
    let state = await findState(properties.STATE);
    state = state[0];

    if (!state) {
      const newState = {
        STNAME: properties.STATE,
        levelLocationName: properties.STATE,
        STNAME_SH: properties.STATE,
        Shape_Length: 0,
        Shape_Area: 0,
        State_LGD: 0,
        MaxSimpTol: 0,
        MinSimpTol: 0,
        metadata: JSON.stringify({ createdBy: 'insertVillageData script' }),
      };

      try {
        await executeStateCreateQuery(newState, `{
          "type": "GeometryCollection",
          "geometries": []
        }`);
      } catch (e) {
        continue;
      }
      state = await findState(properties.STATE);
      state = state[0];
      console.log(`Created new state: ${properties.STATE}`);
    }

    // Find or create the districtId based on the district code (dtcode11) and district name (DISTRICT)
    let district = await findDistrict(properties.DISTRICT);
    district = district[0];

    if (!district) {
      const newDistrict = {
        DISTRICT: properties.DISTRICT,
        levelLocationName: properties.DISTRICT,
        SHAPE_Length: 0,
        SHAPE_Area: 0,
        Dist_LGD: 0,
        metadata: JSON.stringify({ createdBy: 'insertVillageData script' }),
        // @ts-ignore
        stateId: state.stcode11,
      };

      try {
        await executeDistrictCreateQuery(newDistrict, `{
          "type": "GeometryCollection",
          "geometries": []
        }`, state);
      } catch (e) {
        continue;
      }
      district = await findDistrict(properties.DISTRICT);
      district = district[0];
      console.log(`Created new district: ${properties.DISTRICT}`);
    }

    // Find or create the subDistrictId based on the subdistrict code (sdtcode11) and subdistrict name (SUB_DIST)
    let subDistrict = await findSubDistrict(properties.SUB_DIST);
    subDistrict = subDistrict[0];

    if (!subDistrict) {
      const newSubDistrict = {
        sdtname: properties.SUB_DIST,
        levelLocationName: properties.SUB_DIST,
        Shape_Length: 0,
        Shape_Area: 0,
        Subdt_LGD: 0,

        // @ts-ignore
        stateId: state.stcode11,
        // @ts-ignore
        districtId: district.dtcode11,
      };

      try {
        await executeSubDistrictCreateQuery(newSubDistrict, `{
          "type": "GeometryCollection",
          "geometries": []
        }`, state, district);
      } catch (e) {
        continue;
      }
      subDistrict = await findSubDistrict(properties.SUB_DIST);
      subDistrict = subDistrict[0];
      console.log(`Created new subdistrict: ${properties.SUB_DIST}`);
    }

    try {
      await executeVillageCreateQuery(properties, geoJsonData, state, district, subDistrict);
      console.log(`Ingested: ${properties.NAME}`);
    } catch (error) {
      if (error.meta && error.meta.code === '23505') {
        console.log(`Village already exists: ${properties.NAME}. Skipping...`);
      } else {
        console.error(`Error inserting Village data for ${properties.NAME}:`, error);
      }
    }
  }

  console.log('Village data ingestion completed!');
};

const insertVillageData = async (directoryPath) => {
  const walk = async (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        await walk(fullPath);
      } else if (path.extname(fullPath) === '.geojson') {
        await processGeojsonFile(fullPath);
      }
    }
  };

  await walk(directoryPath);
};

insertVillageData(villageMasterLocation)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during village data ingestion:', e);
    await prisma.$disconnect();
  });
