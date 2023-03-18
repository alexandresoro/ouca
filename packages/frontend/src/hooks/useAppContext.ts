import { useContext } from "react";
import { AppContext } from "../contexts/AppContext";

export default function useAppContext() {
  const appContext = useContext(AppContext);
  return appContext;
}
