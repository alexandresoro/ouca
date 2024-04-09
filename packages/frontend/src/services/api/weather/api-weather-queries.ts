import { weatherInfoSchema } from "@ou-ca/common/api/weather";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

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
