import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import LieuDitTable from "./LieuDitTable";

const LieuDitPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("localities") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/localities" });
  };

  return (
    <>
      <ManageTopBar title={t("localities")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <LieuDitTable />
      </ContentContainerLayout>
    </>
  );
};

export default LieuDitPage;
