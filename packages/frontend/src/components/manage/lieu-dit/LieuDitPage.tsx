import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useAppContext from "../../../hooks/useAppContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_LIEUX_DITS_QUERY } from "./LieuDitManageQueries";
import LieuDitTable from "./LieuDitTable";

const LieuDitPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const { apiUrl } = useAppContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_LIEUX_DITS_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportLieuxDits) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportLieuxDits, `${t("localities")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("localities")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <LieuDitTable />
      </ContentContainerLayout>
    </>
  );
};

export default LieuDitPage;
