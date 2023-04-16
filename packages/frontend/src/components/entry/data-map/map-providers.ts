import { type TFuncKey } from "i18next";
import { type Style } from "mapbox-gl";
import ignMapStyle from "./ign.json";

export const MAP_PROVIDERS = {
  osm: {
    nameKey: "maps.maps.openStreetMap.name",
    mapboxStyle: "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
  },
  ign: {
    nameKey: "maps.maps.ign.name",
    mapboxStyle: ignMapStyle as Style,
  },
} satisfies Record<
  string,
  {
    nameKey: TFuncKey;
    mapboxStyle: string | Style;
  }
>;
