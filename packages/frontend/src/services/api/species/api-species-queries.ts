import { getSpeciesPaginatedResponse } from "@ou-ca/common/api/species";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiSpeciesQueryAll = (
  params: UseApiQueryCommonParams,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSpeciesPaginatedResponse>>,
) =>
  useApiQuery(
    "/species",
    {
      schema: getSpeciesPaginatedResponse,
      ...params,
    },
    swrOptions,
  );
