import type { ParseKeys } from "i18next";
import type { MapStyle } from "react-map-gl/maplibre";
import ignMapSatelliteStyle from "./ign-satellite.json";

export const MAP_STYLE_PROVIDERS = {
  osm: {
    nameKey: "maps.maps.openStreetMap.name",
    mapboxStyle: "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
  },
  ign: {
    nameKey: "maps.maps.ign.name",
    // https://geoservices.ign.fr/documentation/services/services-geoplateforme/diffusion#70064
    // https://geoservices.ign.fr/documentation/services/api-et-services-ogc/tuiles-vectorielles-tmswmts/styles
    mapboxStyle: "https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json",
  },
  ignClassique: {
    nameKey: "maps.maps.ignClassique.name",
    mapboxStyle: "https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/classique.json",
  },
  ignSatellite: {
    nameKey: "maps.maps.ignSatellite.name",
    mapboxStyle: ignMapSatelliteStyle as MapStyle,
  },
} satisfies Record<
  string,
  {
    nameKey: ParseKeys;
    mapboxStyle: string | MapStyle;
  }
>;
