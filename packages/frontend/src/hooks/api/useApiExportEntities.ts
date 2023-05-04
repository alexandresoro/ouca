import { EXCEL_FILE_EXTENSION } from "../../utils/constants";
import { downloadFile } from "../../utils/file-download-helper";
import useApiMutation from "./useApiMutation";

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
