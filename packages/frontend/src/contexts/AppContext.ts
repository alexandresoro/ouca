import { createContext } from "react";

export type AppContext = {
  apiUrl: string;
  isSentryEnabled: boolean;
  features: {
    tmp_import: boolean;
    tmp_view_search_filters: boolean;
    tmp_export_search_results: boolean;
  };
};

export const DEFAULT_CONFIG = {
  apiUrl: "",
  isSentryEnabled: false,
  features: {
    tmp_import: false,
    tmp_view_search_filters: false,
    tmp_export_search_results: false,
  },
} satisfies AppContext;

export const AppContext = createContext<AppContext>(DEFAULT_CONFIG);
