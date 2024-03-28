import { configAtom } from "@services/config/config";
import { atom, useAtomValue } from "jotai";

const API_PATH = "/api/v1";

export const apiUrlAtom = atom((get) => {
  return get(configAtom).apiUrl ?? "";
});

const useApiUrl = (includeApiPath = true) => {
  const apiUrl = useAtomValue(apiUrlAtom);

  if (!includeApiPath) {
    return apiUrl;
  }

  return `${apiUrl}${API_PATH}`;
};

export default useApiUrl;
