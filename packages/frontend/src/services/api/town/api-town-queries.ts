import { townInfoSchema } from "@ou-ca/common/api/town";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiTownInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof townInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/towns/${id}/info` : null,
    {
      schema: townInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};
