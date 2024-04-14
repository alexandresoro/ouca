import {
  departmentInfoSchema,
  getDepartmentResponse,
  getDepartmentsResponse,
  upsertDepartmentResponse,
} from "@ou-ca/common/api/department";
import { useApiFetch } from "@services/api/useApiFetch";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
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

export const useApiDepartmentsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getDepartmentResponse>,
) => {
  return useApiInfiniteQuery(
    "/departments",
    {
      queryParams,
      schema: getDepartmentsResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiDepartmentCreate = () => {
  return useApiFetch({
    path: "/departments",
    method: "POST",
    schema: upsertDepartmentResponse,
  });
};

export const useApiDepartmentUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertDepartmentResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/departments/${id}` : null,
    {
      method: "PUT",
      schema: upsertDepartmentResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiDepartmentDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/departments/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
