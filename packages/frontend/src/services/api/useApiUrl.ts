import { configAtom } from "@services/config/config";
import { atom, useAtomValue } from "jotai";

const API_PATH = "/api/v1";

export const apiUrlAtom = atom((get) => {
  return get(configAtom).apiUrl ?? "";
});

const useApiUrl = () => {
  const apiUrl = useAtomValue(apiUrlAtom);

  return `${apiUrl}${API_PATH}`;
};

export default useApiUrl;
