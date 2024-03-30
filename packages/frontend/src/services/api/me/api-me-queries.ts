import { getMeResponse } from "@ou-ca/common/api/me";
import { useApiQuery } from "@services/api/useApiQuery";

export const useApiMe = () => {
  const { data } = useApiQuery(
    "/me",
    {
      schema: getMeResponse,
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  return data;
};
