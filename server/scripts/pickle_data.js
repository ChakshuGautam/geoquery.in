import {default as geojsonRbush} from 'geojson-rbush';
import { polygon, multiPolygon, point, booleanContains } from '@turf/turf';
import * as fs from 'fs';

let tree = geojsonRbush();

function buildTree(geoJSONPaths) {
  geoJSONPaths.map((path) => {
    const geoJSON = JSON.parse(fs.readFileSync(path, 'utf8'));
    geoJSON.features.map((data) => {
      if (data.geometry.type === 'Polygon'){
        tree.insert(polygon(data.geometry.coordinates, data.properties))
      } else{
        tree.insert(multiPolygon(data.geometry.coordinates, data.properties))
      }
    });
  })
}

buildTree([
  '<PATH_TO_YOUR_GEOJSON1_FILE>',
  '<PATH_TO_YOUR_GEOJSON2_FILE>'
]);

// Comment for future testing Purposes
// let p = point([
//     80.9115,
//     26.8756
//   ]);
// let res = tree.search(p)
// log(res.features.map(data => log(data.properties)));

fs.writeFile('../pickled_output.json', JSON.stringify(tree.toJSON()), 'utf8', (err) => {
  if (err) {
    console.error('An error occurred:', err);
    return;
  }
  console.log('Output written to pickled_output.json');
});