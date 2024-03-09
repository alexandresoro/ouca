import type { ParseKeys } from "i18next";
import type { MapStyle } from "react-map-gl";
import ignMapSatelliteStyle from "./ign-satellite.json";
import ignMapStyle from "./ign.json";

export const MAP_STYLE_PROVIDERS = {
  osm: {
    nameKey: "maps.maps.openStreetMap.name",
    mapboxStyle: "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
  },
  ign: {
    nameKey: "maps.maps.ign.name",
    mapboxStyle: ignMapStyle as unknown as MapStyle,
  },
  ignSatellite: {
    nameKey: "maps.maps.ignSatellite.name",
    mapboxStyle: ignMapSatelliteStyle as unknown as MapStyle,
  },
} satisfies Record<
  string,
  {
    nameKey: ParseKeys;
    mapboxStyle: string | MapStyle;
  }
>;
