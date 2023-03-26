import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_ESTIMATIONS_DISTANCE_QUERY } from "./EstimationDistanceManageQueries";
import EstimationDistanceTable from "./EstimationDistanceTable";

const EstimationDistancePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_ESTIMATIONS_DISTANCE_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportEstimationsDistance) {
      downloadFile(
        apiUrl,
        DOWNLOAD_PATH + data.exportEstimationsDistance,
        `${t("distancePrecisions")}${EXCEL_FILE_EXTENSION}`
      );
    }
  };

  return (
    <>
      <ManageTopBar title={t("distancePrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout
      >
        <EstimationDistanceTable />
      </ContentContainerLayout>
    </>
  );
};

export default EstimationDistancePage;
