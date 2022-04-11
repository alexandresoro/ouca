import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import EstimationNombreTable from "./EstimationNombreTable";

type ExportEstimationsNombreResult = {
  exportEstimationsNombre: string | null;
};

const EXPORT_QUERY = gql`
  query ExportEstimationsNombre {
    exportEstimationsNombre
  }
`;

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportEstimationsNombreResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only"
    });
    if (data.exportEstimationsNombre) {
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
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <EstimationNombreTable />
      </Container>
    </>
  );
};

export default EstimationNombrePage;
