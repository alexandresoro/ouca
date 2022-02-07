import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import CommuneTable from "./CommuneTable";

type ExportCommunesResult = {
  exportCommunes: string | null;
};

const EXPORT_QUERY = gql`
  query ExportCommunes {
    exportCommunes
  }
`;

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportCommunesResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only"
    });
    if (data.exportCommunes) {
      downloadFile(DOWNLOAD_PATH + data.exportCommunes, `${t("cities")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("cities")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <CommuneTable />
      </Container>
    </>
  );
};

export default CommunePage;
