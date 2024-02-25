import fgdb from 'fgdb';
import * as fs from 'fs/promises';
import * as path from "path";
import Logger from '../util/logger';

const Logger = new Logger('gdb_to_geojson.js');
const inputDir = `${import.meta.dir}/../geojson-data/indian_villages_boundaries.zip`;
const outputDir = `${import.meta.dir}/../geojson-data/indian_village_boundaries`;

function isZipFile(filename) {
  return filename.endsWith('.zip');
}

async function createIfAbsent(filePath) {
  if (!await fs.exists(filePath)) {
    await fs.mkdir(filePath, {recursive: true});
  }
}

const convertGDBtoGeoJSON = async (gdbFileBuffer, outputFilePath) => {
  try {
    const geoJSON = await fgdb(gdbFileBuffer);
    const contentToWrite = JSON.stringify(geoJSON);
    await fs.writeFile(outputFilePath, contentToWrite, 'utf8');
    Logger.debug("Converted and saved:", outputFilePath);

  } catch (error) {
    Logger.error("Error converting GDB to GeoJSON:", error);
  }
};

const processFiles = async () => {
  await createIfAbsent(outputDir);
  const items = await fs.readdir(inputDir, {withFileTypes: true, recursive: true});

  for (const item of items) {
    const itemPath = path.join(inputDir, item.name);

    if (!isZipFile(item.name)) {
      await createIfAbsent(path.join(outputDir, item.name));
    } else if (isZipFile(item.name)) {
      const fileBuffer = await fs.readFile(itemPath);
      await convertGDBtoGeoJSON(fileBuffer, path.join(outputDir, item.name.replace(/\.zip$/i, '.geoJSON')));
    }
  }
};


processFiles().then(r => {
  Logger.debug("Converted all gdbs to geJSON");
});
