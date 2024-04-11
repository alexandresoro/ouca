import useApiMutation from "@hooks/api/useApiMutation";
import { useApiFetchResponse } from "@services/api/useApiFetchResponse";
import { downloadFile } from "@utils/dom/file-download-helper";

const EXCEL_FILE_EXTENSION = ".xlsx";

/**
 * @deprecated use useApiDownloadExport instead
 */
const useApiExportEntities = ({ filename }: { filename: string }) => {
  return useApiMutation(
    {
      method: "POST",
      responseHandler: (response) => {
        return response.headers.get("Location");
      },
    },
    {
      onSuccess: (location) => {
        if (location) {
          downloadFile(location, `${filename}${EXCEL_FILE_EXTENSION}`);
        }
      },
    },
  );
};

export const useApiDownloadExport = ({ filename, path }: { filename: string; path: string }) => {
  const fetchExport = useApiFetchResponse({
    path,
    method: "POST",
  });

  const downloadExport = async () => {
    const response = await fetchExport();

    const exportLocation = response.headers.get("Location");

    if (exportLocation) {
      downloadFile(exportLocation, `${filename}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return downloadExport;
};

/**
 * @deprecated use useApiDownloadExport instead
 */
export default useApiExportEntities;
