import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_ESTIMATIONS_NOMBRE_QUERY } from "./EstimationNombreManageQueries";
import EstimationNombreTable from "./EstimationNombreTable";

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client
      .query(EXPORT_ESTIMATIONS_NOMBRE_QUERY, {}, { requestPolicy: "network-only" })
      .toPromise();
    if (data?.exportEstimationsNombre) {
      downloadFile(
        apiUrl,
        DOWNLOAD_PATH + data.exportEstimationsNombre,
        `${t("numberPrecisions")}${EXCEL_FILE_EXTENSION}`
      );
    }
  };

  return (
    <>
      <ManageTopBar title={t("numberPrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EstimationNombreTable />
      </ContentContainerLayout>
    </>
  );
};

export default EstimationNombrePage;
