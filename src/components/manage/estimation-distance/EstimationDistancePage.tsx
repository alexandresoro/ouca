import { useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { graphql } from "../../../gql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import EstimationDistanceTable from "./EstimationDistanceTable";

const EXPORT_QUERY = graphql(`
  query ExportEstimationsDistance {
    exportEstimationsDistance
  }
`);

const EstimationDistancePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only",
    });
    if (data.exportEstimationsDistance) {
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
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5,
        }}
      >
        <EstimationDistanceTable />
      </Container>
    </>
  );
};

export default EstimationDistancePage;
