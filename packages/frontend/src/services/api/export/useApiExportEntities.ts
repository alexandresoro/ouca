import useApiMutation from "@hooks/api/useApiMutation";
import { downloadFile } from "@utils/dom/file-download-helper";

const EXCEL_FILE_EXTENSION = ".xlsx";

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

export default useApiExportEntities;
