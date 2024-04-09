import { localityInfoSchema } from "@ou-ca/common/api/locality";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiLocalityInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof localityInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/localities/${id}/info` : null,
    {
      schema: localityInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};
