import { getSexResponse, sexInfoSchema } from "@ou-ca/common/api/sex";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
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
