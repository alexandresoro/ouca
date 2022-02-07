import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import EstimationDistanceTable from "./EstimationDistanceTable";

type ExportEstimationsDistanceResult = {
  exportEstimationsDistance: string | null;
};

const EXPORT_QUERY = gql`
  query ExportEstimationsDistance {
    exportEstimationsDistance
  }
`;

const EstimationDistancePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportEstimationsDistanceResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only"
    });
    if (data.exportEstimationsDistance) {
      downloadFile(DOWNLOAD_PATH + data.exportEstimationsDistance, `${t("distancePrecisions")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("distancePrecisions")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <EstimationDistanceTable />
      </Container>
    </>
  );
};

export default EstimationDistancePage;
