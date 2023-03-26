import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_ESPECES_QUERY } from "./EspeceManageQueries";
import EspeceTable from "./EspeceTable";

const EspecePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_ESPECES_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportEspeces) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportEspeces, `${t("species")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("species")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EspeceTable />
      </ContentContainerLayout>
    </>
  );
};

export default EspecePage;
