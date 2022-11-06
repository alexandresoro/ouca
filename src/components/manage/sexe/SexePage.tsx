import { Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import { graphql } from "../../../gql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ManageTopBar from "../common/ManageTopBar";
import SexeTable from "./SexeTable";

const EXPORT_QUERY = graphql(`
  query ExportSexes {
    exportSexes
  }
`);

const SexePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportSexes) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportSexes, `${t("genders")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("genders")} onClickExport={handleExportClick} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5,
        }}
      >
        <SexeTable />
      </Container>
    </>
  );
};

export default SexePage;
