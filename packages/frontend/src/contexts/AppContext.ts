import { createContext } from "react";

export type AppContext = {
  isSentryEnabled: boolean;
  features: {
    tmp_import: boolean;
    tmp_view_search_filters: boolean;
  };
};

export const DEFAULT_CONFIG = {
  isSentryEnabled: false,
  features: {
    tmp_import: false,
    tmp_view_search_filters: false,
  },
} satisfies AppContext;

export const AppContext = createContext<{
  appContext: AppContext;
  setAppContext: (appContext: AppContext) => void;
}>({
  appContext: DEFAULT_CONFIG,
  setAppContext: () => {
    /**/
  },
});
