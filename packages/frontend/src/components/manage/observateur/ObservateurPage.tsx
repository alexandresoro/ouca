import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_OBSERVATEURS_QUERY } from "./ObservateurManageQueries";
import ObservateurTable from "./ObservateurTable";

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_OBSERVATEURS_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportObservateurs) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportObservateurs, `${t("observer")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("observers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ObservateurTable />
      </ContentContainerLayout>
    </>
  );
};

export default ObservateurPage;
