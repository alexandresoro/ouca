import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { FeatureCollection, Point } from "geojson";

export const useApiLocalitiesGeoJsonQuery = (swrOptions?: UseApiQuerySWROptions<FeatureCollection<Point>>) => {
  return useApiQuery(
    "/geojson/localities.json",
    {},
    {
      ...swrOptions,
    },
  );
};
