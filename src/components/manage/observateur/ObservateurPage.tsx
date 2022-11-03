import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurTable from "./ObservateurTable";

type ExportObservateursResult = {
  exportObservateurs: string | null;
};

const EXPORT_QUERY = gql`
  query ExportObservateurs {
    exportObservateurs
  }
`;

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportObservateursResult>({
      query: EXPORT_QUERY,
      fetchPolicy: "network-only",
    });
    if (data.exportObservateurs) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportObservateurs, `${t("observer")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("observers")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5,
        }}
      >
        <ObservateurTable />
      </Container>
    </>
  );
};

export default ObservateurPage;
