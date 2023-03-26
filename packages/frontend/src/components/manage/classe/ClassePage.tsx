import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import useAppContext from "../../../hooks/useAppContext";
import { DOWNLOAD_PATH, EXCEL_FILE_EXTENSION } from "../../../utils/constants";
import { downloadFile } from "../../../utils/file-download-helper";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import { EXPORT_CLASSES_QUERY } from "./ClasseManageQueries";
import ClasseTable from "./ClasseTable";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const client = useClient();

  const { apiUrl } = useAppContext();

  const handleExportClick = async () => {
    const { data } = await client.query(EXPORT_CLASSES_QUERY, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.exportClasses) {
      downloadFile(apiUrl, DOWNLOAD_PATH + data.exportClasses, `${t("speciesClasses")}${EXCEL_FILE_EXTENSION}`);
    }
  };

  return (
    <>
      <ManageTopBar title={t("speciesClasses")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ClasseTable />
      </ContentContainerLayout>
    </>
  );
};

export default ClassePage;
