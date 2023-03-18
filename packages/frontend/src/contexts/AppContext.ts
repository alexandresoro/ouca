import { createContext } from "react";

export type AppContext = {
  isSentryEnabled: boolean;
};

export const DEFAULT_CONFIG = {
  isSentryEnabled: false,
} satisfies AppContext;

export const AppContext = createContext<{
  appContext: AppContext;
  setAppContext: (userInfo: AppContext) => void;
}>({
  appContext: DEFAULT_CONFIG,
  setAppContext: () => {
    /**/
  },
});
