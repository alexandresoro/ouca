import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import MilieuTable from "./MilieuTable";

type ExportMilieuxResult = {
  exportMilieux: string | null;
};

const EXPORT_QUERY = gql`
  query ExportMilieux {
    exportMilieux
  }
`;

const MilieuPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportMilieuxResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only"
    });
    if (data.exportMilieux) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportMilieux, `${t("environments")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("environments")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <MilieuTable />
      </Container>
    </>
  );
};

export default MilieuPage;
