import { createContext } from "react";
import { type Notification } from "../types/Notification";

export const SnackbarContext = createContext<{
  displayNotification: (content: Omit<Notification, "id">) => number;
}>({
  displayNotification: () => {
    throw "No provider defined";
  },
});
