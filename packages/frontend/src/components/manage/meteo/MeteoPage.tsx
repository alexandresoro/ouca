import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_METEOS_QUERY } from "./MeteoManageQueries";
import MeteoTable from "./MeteoTable";

const MeteoPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_METEOS_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportMeteos) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportMeteos, `${t("weathers")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("weathers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MeteoTable />
      </ContentContainerLayout>
    </>
  );
};

export default MeteoPage;
