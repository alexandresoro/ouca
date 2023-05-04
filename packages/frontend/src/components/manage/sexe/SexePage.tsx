import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import SexeTable from "./SexeTable";

const SexePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("genders") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/sexes" });
  };

  return (
    <>
      <ManageTopBar title={t("genders")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <SexeTable />
      </ContentContainerLayout>
    </>
  );
};

export default SexePage;
