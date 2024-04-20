import { configAtom } from "@services/config/config";
import { useAtomValue } from "jotai";

const API_PATH = "/api/v1";

export const useApiUrl = (includeApiPath = true) => {
  const config = useAtomValue(configAtom);
  const apiUrl = config.apiUrl ?? "";

  if (!includeApiPath) {
    return apiUrl;
  }

  return `${apiUrl}${API_PATH}`;
};
