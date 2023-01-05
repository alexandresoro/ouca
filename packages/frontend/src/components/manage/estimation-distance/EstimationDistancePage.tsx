import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
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

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
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
