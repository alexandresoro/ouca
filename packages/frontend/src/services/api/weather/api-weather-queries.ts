import {
  getWeatherResponse,
  getWeathersResponse,
  upsertWeatherResponse,
  weatherInfoSchema,
} from "@ou-ca/common/api/weather";
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

export const useApiWeatherQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getWeatherResponse>>,
) => {
  return useApiQuery(
    id != null ? `/weathers/${id}` : null,
    {
      schema: getWeatherResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiWeatherInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof weatherInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/weathers/${id}/info` : null,
    {
      schema: weatherInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiWeathersQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getWeathersResponse>>,
) => {
  return useApiQuery(
    "/weathers",
    {
      queryParams,
      schema: getWeathersResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiWeathersInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getWeatherResponse>,
) => {
  return useApiInfiniteQuery(
    "/weathers",
    {
      queryParams,
      schema: getWeathersResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiWeatherCreate = () => {
  return useApiFetch({
    path: "/weathers",
    method: "POST",
    schema: upsertWeatherResponse,
  });
};

export const useApiWeatherUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertWeatherResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/weathers/${id}` : null,
    {
      method: "PUT",
      schema: upsertWeatherResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiWeatherDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/weathers/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
