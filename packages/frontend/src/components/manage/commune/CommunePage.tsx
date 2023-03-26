import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useAppContext from "../../../hooks/useAppContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_COMMUNES_QUERY } from "./CommuneManageQueries";
import CommuneTable from "./CommuneTable";

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const { apiUrl } = useAppContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_COMMUNES_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportCommunes) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportCommunes, `${t("cities")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("cities")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <CommuneTable />
      </ContentContainerLayout>
    </>
  );
};

export default CommunePage;
