import { useSWRConfig, type Arguments, type MutatorOptions } from "swr";
import useApiUrl from "./useApiUrl";

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

const useApiInvalidateCache = (path: string, mutatorOptions?: MutatorOptions) => {
  const { mutate } = useSWRConfig();
  const apiUrl = useApiUrl();

  const queryUrlPath = `${apiUrl}${path}`;

  return () =>
    mutate(
      (key) => {
        return isMatchingCacheKey(key, queryUrlPath);
      },
      undefined,
      mutatorOptions
    );
};

export default useApiInvalidateCache;
