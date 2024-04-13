import { getClassesResponse, speciesClassInfoSchema } from "@ou-ca/common/api/species-class";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiSpeciesClassInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof speciesClassInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/classes/${id}/info` : null,
    {
      schema: speciesClassInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getClassesResponse>>,
) => {
  return useApiQuery(
    "/classes",
    {
      queryParams,
      schema: getClassesResponse,
    },
    {
      ...swrOptions,
    },
  );
};
