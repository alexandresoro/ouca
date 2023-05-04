import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurTable from "./ObservateurTable";

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("observer") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/observers" });
  };

  return (
    <>
      <ManageTopBar title={t("observers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ObservateurTable />
      </ContentContainerLayout>
    </>
  );
};

export default ObservateurPage;
