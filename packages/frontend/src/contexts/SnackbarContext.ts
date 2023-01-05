import { AlertColor } from "@mui/material";
import { createContext } from "react";

export type SnackbarContentType = {
  timestamp?: number;
  type?: AlertColor;
  message?: string;
};

export const SnackbarContext = createContext<{
  snackbarContent: SnackbarContentType;
  setSnackbarContent: (content: Omit<SnackbarContentType, "timestamp">) => void;
}>({
  snackbarContent: {},
  setSnackbarContent: () => {
    /**/
  },
});
