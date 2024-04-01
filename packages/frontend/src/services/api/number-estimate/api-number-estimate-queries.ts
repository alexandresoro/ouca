import { getNumberEstimateResponse } from "@ou-ca/common/api/number-estimate";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiNumberEstimateQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getNumberEstimateResponse>>,
) => {
  return useApiQuery(
    id != null ? `/number-estimates/${id}` : null,
    {
      schema: getNumberEstimateResponse,
    },
    {
      ...swrOptions,
    },
  );
};
