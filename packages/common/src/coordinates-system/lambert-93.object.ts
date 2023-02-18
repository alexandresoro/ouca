import { LAMBERT_93, type CoordinatesSystem } from "./coordinates-system.object.js";

export const LAMBERT_93_COORDINATES: CoordinatesSystem = {
  code: LAMBERT_93,
  epsgCode: "EPSG:2154",
  name: "Lambert 93",
  decimalPlaces: 2,
  unitName: "mètres",
  longitudeRange: { min: 0, max: 1300000 },
  latitudeRange: { min: 6000000, max: 7200000 },
  proj4Formula:
    "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
};
