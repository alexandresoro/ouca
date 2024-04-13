import { getSexResponse, getSexesResponse, sexInfoSchema } from "@ou-ca/common/api/sex";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiSexQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSexResponse>>,
) => {
  return useApiQuery(
    id != null ? `/sexes/${id}` : null,
    {
      schema: getSexResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof sexInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/sexes/${id}/info` : null,
    {
      schema: sexInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSexesResponse>>,
) => {
  return useApiQuery(
    "/sexes",
    {
      queryParams,
      schema: getSexesResponse,
    },
    {
      ...swrOptions,
    },
  );
};
