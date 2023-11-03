import { atom, useAtomValue } from "jotai";

const API_PATH = "/api/v1";

export const apiUrlAtom = atom("");

const useApiUrl = () => {
  const apiUrl = useAtomValue(apiUrlAtom);

  return `${apiUrl}${API_PATH}`;
};

export default useApiUrl;
