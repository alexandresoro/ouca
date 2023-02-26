import { useContext } from "react";
import { SnackbarContext } from "../contexts/SnackbarContext";

export default function useSnackbar() {
  const snackbarContext = useContext(SnackbarContext);
  return {
    displayNotification: snackbarContext.displayNotification,
  };
}
