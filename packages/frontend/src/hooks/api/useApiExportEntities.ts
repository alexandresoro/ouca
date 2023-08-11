import { downloadFile } from "../../utils/file-download-helper";
import useApiMutation from "./useApiMutation";

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
    }
  );
};

export default useApiExportEntities;
