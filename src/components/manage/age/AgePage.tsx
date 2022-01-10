import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import AgeTable from "./AgeTable";

type ExportAgesResult = {
  exportAges: string | null;
};

const EXPORT_AGES = gql`
  query ExportAges {
    exportAges
  }
`;

const AgePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportAgesResult>({
      query: EXPORT_AGES,
      fetchPolicy: "network-only"
    });
    if (data.exportAges) {
      downloadFile(DOWNLOAD_PATH + data.exportAges, `${t("age")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("agesButton")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <AgeTable />
      </Container>
    </>
  );
};

export default AgePage;
