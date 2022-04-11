import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import ComportementTable from "./ComportementTable";

type ExportComportementsResult = {
  exportComportements: string | null;
};

const EXPORT_QUERY = gql`
  query ExportComportements {
    exportComportements
  }
`;

const ComportementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportComportementsResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only"
    });
    if (data.exportComportements) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportComportements, `${t("behaviors")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("behaviors")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <ComportementTable />
      </Container>
    </>
  );
};

export default ComportementPage;
