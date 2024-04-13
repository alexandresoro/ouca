import { departmentInfoSchema, getDepartmentResponse, getDepartmentsResponse } from "@ou-ca/common/api/department";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
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

export const useApiDepartmentInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof departmentInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/departments/${id}/info` : null,
    {
      schema: departmentInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDepartmentsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getDepartmentsResponse>>,
) => {
  return useApiQuery(
    "/departments",
    {
      queryParams,
      schema: getDepartmentsResponse,
    },
    {
      ...swrOptions,
    },
  );
};
