import Map from "ol/Map";
import TileJSON from "ol/source/TileJSON";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";

const map = new Map({
  layers: [
    new TileLayer({
      source: new TileJSON({
        url: "http://localhost:8080/styles/512/basic-preview.json",
        crossOrigin: "anonymous",
      }),
    }),
  ],
  target: "map",
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
