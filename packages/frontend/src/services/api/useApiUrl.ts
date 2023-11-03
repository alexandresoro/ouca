import useAppContext from "@hooks/useAppContext";

const useApiUrl = () => {
  const { apiUrl } = useAppContext();

  return apiUrl;
};

export default useApiUrl;
