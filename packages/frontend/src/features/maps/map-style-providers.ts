import { getConfig } from "@services/config/config";
import type { ParseKeys } from "i18next";
import layers from "protomaps-themes-base";
import type { MapStyle } from "react-map-gl/maplibre";
import ignMapSatelliteStyle from "./ign-satellite.json";

const osmProtoMaps = {
  version: 8,
  glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sources: {
    protomaps: {
      type: "vector",
      url: `pmtiles://${getConfig().protomapsOsmUrl}`,
      attribution:
        '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },
  },
  layers: layers("protomaps", "light"),
};

export type MapProvider = "osm" | "ign" | "ignClassique" | "ignSatellite";

export const mapStyleProviders = {
  osm: {
    nameKey: "maps.maps.openStreetMap.name",
    // mapboxStyle: "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
    mapboxStyle: osmProtoMaps as unknown as MapStyle,
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
  MapProvider,
  {
    nameKey: ParseKeys;
    mapboxStyle: string | MapStyle;
  }
>;

export const getFontFamily = (mapStyle: MapProvider) => {
  switch (mapStyle) {
    case "osm":
      return "Noto Sans Regular";
    default:
      return "Open Sans Regular";
  }
};
