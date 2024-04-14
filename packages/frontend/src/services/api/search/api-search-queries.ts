import { getSpeciesPaginatedResponse, type getSpeciesResponse } from "@ou-ca/common/api/species";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
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

export const useApiSearchInfiniteSpecies = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getSpeciesResponse>,
) =>
  useApiInfiniteQuery(
    "/search/species",
    {
      queryParams,
      schema: getSpeciesPaginatedResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
