import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import EspeceTable from "./EspeceTable";

type ExportEspecesResult = {
  exportEspeces: string | null;
};

const EXPORT_QUERY = gql`
  query ExportEspeces {
    exportEspeces
  }
`;

const EspecePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportEspecesResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only",
    });
    if (data.exportEspeces) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportEspeces, `${t("species")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("species")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5,
        }}
      >
        <EspeceTable />
      </Container>
    </>
  );
};

export default EspecePage;
