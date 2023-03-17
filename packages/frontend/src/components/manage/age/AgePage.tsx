import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_AGES_QUERY } from "./AgeManageQueries";
import AgeTable from "./AgeTable";

const AgePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_AGES_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportAges) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportAges, `${t("age")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("ages")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <AgeTable />
      </ContentContainerLayout>
    </>
  );
};

export default AgePage;
