import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useAppContext from "../../../hooks/useAppContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_SEXES_QUERY } from "./SexeManageQueries";
import SexeTable from "./SexeTable";

const SexePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const { apiUrl } = useAppContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_SEXES_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportSexes) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportSexes, `${t("genders")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("genders")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <SexeTable />
      </ContentContainerLayout>
    </>
  );
};

export default SexePage;
