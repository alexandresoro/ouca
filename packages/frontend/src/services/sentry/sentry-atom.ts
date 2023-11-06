import { configAtom } from "@services/config/config";
import { atom } from "jotai";

export const isSentryEnabledAtom = atom((get) => {
  return !!get(configAtom).sentry;
});
