import { useApiFetchResponse } from "@services/api/useApiFetchResponse";
import { downloadFile } from "@utils/dom/file-download-helper";
import { toUrlSearchParams } from "@utils/url/url-search-params";

const EXCEL_FILE_EXTENSION = ".xlsx";

export const useApiDownloadExport = ({
  filename,
  path,
  queryParams,
}: {
  filename: string;
  path: string;
  queryParams?: Record<string, string | string[] | number | number[] | boolean | undefined> | undefined;
}) => {
  const queryString = toUrlSearchParams(queryParams).toString();

  const fetchExport = useApiFetchResponse({
    path: `${path}${queryString.length ? `?${queryString}` : ""}`,
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
