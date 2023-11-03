import useAppContext from "@hooks/useAppContext";

const API_PATH = "/api/v1";

const useApiUrl = () => {
  const { apiUrl } = useAppContext();

  return `${apiUrl}${API_PATH}`;
};

export default useApiUrl;
