import { configAtom } from "@services/config/config";
import { isBrowserUsingDarkModeAtom } from "@utils/dom/browser-dark-mode-atom";
import type { ParseKeys } from "i18next";
import { atom } from "jotai";
import layers from "protomaps-themes-base";
import type { MapStyle } from "react-map-gl/maplibre";

const protoMapsStyleAtom = atom((get) => {
  return get(isBrowserUsingDarkModeAtom) ? "dark" : "light";
});

const osmProtoMapsAtom = atom<MapStyle>((get) => {
  const protomapsOsmUrl = `${get(configAtom).staticAssetsUrl}${get(configAtom).protomapsUrlPath}`;
  const style = get(protoMapsStyleAtom);

  return {
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${style}`,
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${protomapsOsmUrl}`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers("protomaps", style, navigator.language ?? "en"),
  };
});

export type MapProvider = "osm" | "ign" | "ignClassique" | "ignSatellite";

export const mapStyleProvidersAtom = atom((get) => {
  const { staticAssetsUrl } = get(configAtom);
  const osmProtoMaps = get(osmProtoMapsAtom);
  return {
    osm: {
      nameKey: "maps.maps.openStreetMap.name",
      // mapboxStyle: "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
      mapboxStyle: osmProtoMaps,
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
      mapboxStyle: `${staticAssetsUrl}/ign-satellite.json`,
    },
  } satisfies Record<
    MapProvider,
    {
      nameKey: ParseKeys;
      mapboxStyle: string | MapStyle;
    }
  >;
});

export const ignSatelliteTileUrl =
  "https://data.geopf.fr/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal";

export const getFontFamily = (mapStyle: MapProvider) => {
  switch (mapStyle) {
    case "osm":
      return "Noto Sans Regular";
    default:
      return "Open Sans Regular";
  }
};
