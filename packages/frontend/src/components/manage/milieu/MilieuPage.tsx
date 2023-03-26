import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useAppContext from "../../../hooks/useAppContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_MILIEUX_QUERY } from "./MilieuManageQueries";
import MilieuTable from "./MilieuTable";

const MilieuPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const { apiUrl } = useAppContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_MILIEUX_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportMilieux) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportMilieux, `${t("environments")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("environments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MilieuTable />
      </ContentContainerLayout>
    </>
  );
};

export default MilieuPage;
