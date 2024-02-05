import fgdb from 'fgdb';
import * as fs from 'fs/promises';
import * as path from "path";
import JSZip from "jszip";

const inputDir = `${import.meta.dir}/../geojson-data/indian_village_boundaries.zip`;
const outputDir = `${import.meta.dir}/../geojson-data/indian_village_boundaries`;

function isZipFile(filename) {
  return filename.endsWith('.zip');
}

const convertGDBtoGeoJSON = async (gdbFileBuffer, outputFilePath) => {
  try {
    const geoJSON = await fgdb(gdbFileBuffer);
    const contentToWrite = JSON.stringify(geoJSON);
    await fs.writeFile(outputFilePath, contentToWrite, 'utf8');
    console.log("Converted and saved:", outputFilePath);

  } catch (error) {
    console.error("Error converting GDB to GeoJSON:", error);
  }
};


const processZipFiles = async () => {
  let new_zip = new JSZip();
  let parent_file_data = await fs.readFile(inputDir);
  let parent_folder = await new_zip.loadAsync(parent_file_data);

  await fs.rm(outputDir, {recursive: true, force: true});
  await fs.mkdir(outputDir);


  for (const fileName of Object.keys(parent_folder.files)) {
    const file = parent_folder.files[fileName];

    if (!isZipFile(fileName)) {
      await fs.rm(path.join(outputDir, fileName), {recursive: true, force: true});
      await fs.mkdir(path.join(outputDir, fileName), {recursive: true});
    } else if (isZipFile(fileName)) {
      const fileBuffer = await parent_folder.file(fileName).async('nodebuffer');
      await convertGDBtoGeoJSON(fileBuffer, path.join(outputDir, fileName.replace(/\.zip$/i, '.geoJSON')));
    }
  }
}


processZipFiles().then(r => {
  console.log("Converted all gdbs to geJSON");
});