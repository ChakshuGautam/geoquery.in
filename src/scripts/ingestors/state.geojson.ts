import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { executeStateCreateQuery } from './service.geojson';

const prisma = new PrismaClient();
const subDistrictGeoJSONLocation = `${__dirname}/../../geojson-data/INDIA_STATE.geojson`;


const insertStateData = async () => {
  const rawData = fs.readFileSync(subDistrictGeoJSONLocation);
  const geojson = JSON.parse(rawData.toString());

  for (const feature of geojson.features) {
    const properties = feature.properties;
    const geoJsonData = JSON.stringify(feature.geometry);
    console.log(`Ingesting: ${properties.stname}`);
    try {
      await executeStateCreateQuery(properties, geoJsonData);
      console.log(`Ingested: ${properties.stname} !`);
    } catch (error) {
      if (error.meta && error.meta.code === '23505') {
        console.log(`State already exists: ${properties.stname}. Skipping...`);
      } else {
        console.error(`Error inserting state data for ${properties.stname}:`, error);
      }
    }
    console.log(`Ingeted: ${properties.stname} !`);
  }

  console.log('State data added successfully!');
};

insertStateData()
  .then(async () => {

    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error inserting state data:', e);
    await prisma.$disconnect();
  });
