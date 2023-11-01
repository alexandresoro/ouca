import useAppContext from "@hooks/useAppContext";
import { useSWRConfig, type Arguments, type MutatorOptions } from "swr";

const isApiCacheKey = (key: Arguments): key is { url: string } => {
  return (
    key != null && typeof key === "object" && !Array.isArray(key) && Object.prototype.hasOwnProperty.call(key, "url")
  );
};

const isMatchingCacheKey = (key: Arguments, queryUrlPath: string): boolean => {
  if (isApiCacheKey(key)) {
    return key.url === queryUrlPath;
  }

  return false;
};

const useSWRApiInvalidateCache = (path: string, mutatorOptions?: MutatorOptions) => {
  const { mutate } = useSWRConfig();
  const { apiUrl } = useAppContext();

  const queryUrlPath = `${apiUrl}/api/v1${path}`;

  return () =>
    mutate(
      (key) => {
        return isMatchingCacheKey(key, queryUrlPath);
      },
      undefined,
      mutatorOptions
    );
};

export default useSWRApiInvalidateCache;
