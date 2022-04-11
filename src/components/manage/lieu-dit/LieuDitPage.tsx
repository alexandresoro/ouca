import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import LieuDitTable from "./LieuDitTable";

type ExportLieuxDitsResult = {
  exportLieuxDits: string | null;
};

const EXPORT_QUERY = gql`
  query ExportLieuxDits {
    exportLieuxDits
  }
`;

const LieuDitPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportLieuxDitsResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only"
    });
    if (data.exportLieuxDits) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportLieuxDits, `${t("localities")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("localities")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <LieuDitTable />
      </Container>
    </>
  );
};

export default LieuDitPage;
