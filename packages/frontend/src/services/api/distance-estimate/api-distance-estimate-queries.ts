import { distanceEstimateInfoSchema } from "@ou-ca/common/api/distance-estimate";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiDistanceEstimateInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof distanceEstimateInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/distance-estimates/${id}/info` : null,
    {
      schema: distanceEstimateInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};
