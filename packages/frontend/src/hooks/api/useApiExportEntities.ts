import { downloadFile } from "../../utils/file-download-helper";
import useApiMutation from "./useApiMutation";

const EXCEL_FILE_EXTENSION = ".xlsx";

const useApiExportEntities = ({ filename }: { filename: string }) => {
  return useApiMutation(
    {
      method: "POST",
      responseHandler: (response) => {
        console.log("headers", response.headers);
        return response.headers.get("Location");
      },
    },
    {
      onSuccess: (location) => {
        console.log("location", location);
        if (location) {
          downloadFile(location, `${filename}${EXCEL_FILE_EXTENSION}`);
        }
      },
    }
  );
};

export default useApiExportEntities;
