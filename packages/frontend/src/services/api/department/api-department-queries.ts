import { getDepartmentResponse } from "@ou-ca/common/api/department";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiDepartmentQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getDepartmentResponse>>,
) => {
  return useApiQuery(
    id != null ? `/departments/${id}` : null,
    {
      schema: getDepartmentResponse,
    },
    {
      ...swrOptions,
    },
  );
};
