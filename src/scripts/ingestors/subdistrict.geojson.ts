import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import {
  executeDistrictCreateQuery,
  executeStateCreateQuery,
  findState,
  findDistrict,
  executeSubDistrictCreateQuery,
} from './service.geojson';

const prisma = new PrismaClient();
const subDistrictGeoJSONLocation = `${__dirname}/../../geojson-data/INDIA_SUBDISTRICT.geojson`;



const insertSubDistrictData = async () => {
  const rawData = fs.readFileSync(subDistrictGeoJSONLocation);
  const geojson = JSON.parse(rawData.toString());

  for (const feature of geojson.features) {
    const properties = feature.properties;
    const geoJsonData = JSON.stringify(feature.geometry);
    console.log(`Ingesting: ${properties.sdtname}`, properties.stname, properties.dtname);

    // Find or create the stateId based on the state code (stcode11) and state name (stname)
    let state = await findState(properties.stname);
    state = state[0];

    if (!state) {
      // Create the state if it does not exist
      const newState = {
        STCODE11: properties.stcode11,
        STNAME: properties.stname,
        levelLocationName: properties.stname,
        STNAME_SH: properties.stname,
        Shape_Length: 0,
        Shape_Area: 0,
        State_LGD: 0,
        MaxSimpTol: 0,
        MinSimpTol: 0,
        metadata: JSON.stringify({ createdBy: 'insertSubDistrictData script' }),
      };

      try {
        await executeStateCreateQuery(newState, `{
          "type": "GeometryCollection",
          "geometries": []
        }`);
      } catch (e) {
        continue;
      }
      state = await findState(properties.stname);
      state = state[0];
      console.log(`Created new state: ${properties.stname}`);
    }

    // Find or create the districtId based on the district code (dtcode11) and district name (dtname)
    let district = await findDistrict(properties.dtname);
    district = district[0];

    if (!district) {
      console.log(properties.dtname);
      // Create the district if it does not exist
      // @ts-ignore
      // @ts-ignore
      const newDistrict = {
        dtcode11: properties.dtcode11,
        dtname: properties.dtname,
        levelLocationName: properties.dtname,
        SHAPE_Length: 0,
        SHAPE_Area: 0,
        Dist_LGD: 0,
        metadata: JSON.stringify({ createdBy: 'insertSubDistrictData script' }),

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
      district = await findDistrict(properties.dtname);
      district = district[0];
      console.log(`Created new district: ${properties.dtname}`);
    }



    // console.log(query);

    try {
      await executeSubDistrictCreateQuery(properties, geoJsonData, state, district);
      console.log(`Ingested: ${properties.sdtname}`);
    }  catch (error) {
      if (error.meta && error.meta.code === '23505') {
        console.log(`SubDistrict already exists: ${properties.dtname}. Skipping...`);
      } else {
        console.error(`Error inserting SubDistrict data for ${properties.dtname}:`, error);
      }
    }
  }

  console.log('Subdistrict data ingestion completed!');
};

insertSubDistrictData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during subdistrict data ingestion:', e);
    await prisma.$disconnect();
  });
