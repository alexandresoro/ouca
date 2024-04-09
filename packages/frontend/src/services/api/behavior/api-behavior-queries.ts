import { behaviorInfoSchema } from "@ou-ca/common/api/behavior";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiBehaviorInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof behaviorInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/behaviors/${id}/info` : null,
    {
      schema: behaviorInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};
