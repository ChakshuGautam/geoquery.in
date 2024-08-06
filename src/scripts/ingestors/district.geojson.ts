import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { executeDistrictCreateQuery, executeStateCreateQuery, findState } from './service.geojson';

const prisma = new PrismaClient();
const districtGeoJSONLocation = `${__dirname}/../../geojson-data/INDIA_DISTRICT.geojson`;

const insertDistrictData = async () => {
  const rawData = fs.readFileSync(districtGeoJSONLocation);
  const geojson = JSON.parse(rawData.toString());

  for (const feature of geojson.features) {
    const properties = feature.properties;
    const geoJsonData = JSON.stringify(feature.geometry);
    let state;

    // Find the stateId based on the fuzzy state name (stname)
    state = await findState(properties.stname);
    state = state[0];
    if (!state) {
      console.error(`State not found for district: ${properties.dtname}`);

      const newState = {
        STCODE11: properties.stcode11,
        STNAME: properties.stname,
        levelLocationName: properties.stname,
        STNAME_SH: properties.stname,
        Shape_Length: 0,
        Shape_Area: 0,
        State_LGD: properties.State_LGD,
        MaxSimpTol: 0,
        MinSimpTol: 0,
        metadata: JSON.stringify({ createdBy: 'insertDistrictData script' }),
      };

      await executeStateCreateQuery(newState, `{
          "type": "GeometryCollection",
          "geometries": []
        }`,
      );
      state = await findState(properties.stname);
      state = state[0];
      console.log(`Created new state: ${properties.stname}`);
    }

    try {
      console.log(`INGESTING: ${properties.dtname}`, state);
      await executeDistrictCreateQuery(properties, geoJsonData, state);
      console.log(`Ingested: ${properties.dtname}`);
    } catch (error) {
      if (error.meta && error.meta.code === '23505') {
        console.log(error);
        console.log(`District already exists: ${properties.dtname}. Skipping...`);
      } else {
        console.log(state);
        console.error(`Error inserting District data for ${properties.dtname}:`, error);
      }
    }
  }
  console.log('District data ingestion completed!');
};

insertDistrictData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during district data ingestion:', e);
    await prisma.$disconnect();
  });
