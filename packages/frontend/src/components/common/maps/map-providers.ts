import { type ParseKeys } from "i18next";
import ignMapStyle from "./ign.json";

export const MAP_PROVIDERS = {
  osm: {
    nameKey: "maps.maps.openStreetMap.name",
    mapboxStyle: "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
  },
  ign: {
    nameKey: "maps.maps.ign.name",
    mapboxStyle: ignMapStyle,
  },
} satisfies Record<
  string,
  {
    nameKey: ParseKeys;
    mapboxStyle: string | unknown;
  }
>;
