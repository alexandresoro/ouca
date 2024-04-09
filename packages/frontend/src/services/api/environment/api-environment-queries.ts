import { environmentInfoSchema } from "@ou-ca/common/api/environment";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiEnvironmentInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof environmentInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/environments/${id}/info` : null,
    {
      schema: environmentInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};
