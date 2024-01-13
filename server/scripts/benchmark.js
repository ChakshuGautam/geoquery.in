import {default as geojsonRbush} from 'geojson-rbush';
import {polygon, multiPolygon, point, booleanContains} from '@turf/turf';
import * as fs from 'fs';

let tree = geojsonRbush();


let p = point([
  80.9115,
  26.8756
]);

let num_geometries = 0;


function buildTree(geoJSON) {

  geoJSON.features.map((data) => {
    if (data.geometry.type === 'Polygon') {
      num_geometries += 1;
      tree.insert(polygon(data.geometry.coordinates, data.properties))
    } else {
      num_geometries += 1;
      tree.insert(multiPolygon(data.geometry.coordinates, data.properties))
    }
  });

}

function indivisualQuery(geoJSON) {
  geoJSON.features.map((data) => {
    if (data.geometry.type === 'Polygon') {
      let poly = polygon(data.geometry.coordinates, data.properties);
      booleanContains(poly, p);
    } else {
      let poly = multiPolygon(data.geometry.coordinates, data.properties);
    }
  });

}

console.log(`Processed ${num_geometries} geometries`);

console.time('indivisualQuery');
const geojsonData = JSON.parse(fs.readFileSync('/path/to/geojson/file', 'utf8'));
indivisualQuery(geojsonData);
console.timeEnd('indivisualQuery');


console.time('treeQuery');
const pickledTreeData = fs.readFileSync('./pickled_output.json', 'utf8')
tree.fromJSON(JSON.parse(pickledTreeData));
let res = tree.search(p)
console.log(res);
console.timeEnd('treeQuery');
