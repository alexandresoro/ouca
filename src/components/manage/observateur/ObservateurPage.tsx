import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurTable from "./ObservateurTable";

type ExportObservateursResult = {
  exportObservateurs: string | null;
};

const EXPORT_OBSERVATEURS = gql`
  query ExportObservateurs {
    exportObservateurs
  }
`;

export default function ObservateurPage(): ReactElement {
  const { t } = useTranslation();

  const client = useApolloClient();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportObservateursResult>({
      query: EXPORT_OBSERVATEURS,
      fetchPolicy: "network-only"
    });
    if (data.exportObservateurs) {
      downloadFile(DOWNLOAD_PATH + data.exportObservateurs, `${t("observer")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("observersButton")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <ObservateurTable />
      </Container>
    </>
  );
}
