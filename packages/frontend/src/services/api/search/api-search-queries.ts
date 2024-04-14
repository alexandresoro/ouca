import { getSpeciesPaginatedResponse } from "@ou-ca/common/api/species";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiSearchSpecies = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSpeciesPaginatedResponse>>,
  { paused = false } = {},
) =>
  useApiQuery(
    "/search/species",
    {
      queryParams,
      schema: getSpeciesPaginatedResponse,
      paused,
    },
    swrOptions,
  );
