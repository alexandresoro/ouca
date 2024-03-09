import { getSettingsResponse } from "@ou-ca/common/api/settings";
import { type SWRConfiguration } from "swr";
import { type z } from "zod";
import useApiQuery from "../useApiQuery";

export const useApiGetSettings = <E = unknown>(
  swrOptions?: Omit<SWRConfiguration<z.infer<typeof getSettingsResponse>, E>, "fetcher">,
) =>
  useApiQuery(
    "/settings",
    {
      schema: getSettingsResponse,
    },
    swrOptions,
  );
