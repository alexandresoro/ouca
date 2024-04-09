import { getSpeciesPaginatedResponse, speciesInfoSchema } from "@ou-ca/common/api/species";
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

export const useApiSpeciesInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof speciesInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/species/${id}/info` : null,
    {
      schema: speciesInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};
