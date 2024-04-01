import { getSexResponse } from "@ou-ca/common/api/sex";
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
