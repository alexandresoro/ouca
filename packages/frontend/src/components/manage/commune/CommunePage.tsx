import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import { graphql } from "../../../gql";
import useApiUrlContext from "../../../hooks/useApiUrlContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import CommuneTable from "./CommuneTable";

const EXPORT_QUERY = graphql(`
  query ExportCommunes {
    exportCommunes
  }
`);

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const apiUrl = useApiUrlContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportCommunes) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportCommunes, `${t("cities")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("cities")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <CommuneTable />
      </ContentContainerLayout>
    </>
  );
};

export default CommunePage;
