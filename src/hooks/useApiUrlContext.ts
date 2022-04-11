import { useContext } from "react";
import { ApiUrlContext } from "../contexts/ApiUrlContext";

export default function useApiUrlContext() {
  const apiUrlContext = useContext(ApiUrlContext);
  return apiUrlContext;
}
