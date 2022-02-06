import { gql, useApolloClient } from "@apollo/client";
import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import DepartementTable from "./DepartementTable";

type ExportDepartementsResult = {
  exportDepartements: string | null;
};

const EXPORT_AGES = gql`
  query ExportDepartements {
    exportDepartements
  }
`;

const DepartementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useApolloClient();

  const handleExportClick = async () => {
    const { data } = await client.query<ExportDepartementsResult>({
      query: EXPORT_AGES,
      fetchPolicy: "network-only"
    });
    if (data.exportDepartements) {
      downloadFile(DOWNLOAD_PATH + data.exportDepartements, `${t("departments")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("departments")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <DepartementTable />
      </Container>
    </>
  );
};

export default DepartementPage;
