import { configAtom } from "@services/config/config";
import { atom } from "jotai";

const API_PATH = "/v1";

export const apiUrlAtom = atom((get) => {
  const config = get(configAtom);
  const apiUrl = config.apiUrl;

  return `${apiUrl}${API_PATH}`;
});
