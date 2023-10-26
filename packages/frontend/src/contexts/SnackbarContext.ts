import { type Notification } from "@typings/Notification";
import { createContext } from "react";

export const SnackbarContext = createContext<{
  displayNotification: (content: Omit<Notification, "id">) => number;
}>({
  displayNotification: () => {
    throw "No provider defined";
  },
});
