import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ComportementTable from "./ComportementTable";

const ComportementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("behaviors") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/behaviors" });
  };

  return (
    <>
      <ManageTopBar title={t("behaviors")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ComportementTable />
      </ContentContainerLayout>
    </>
  );
};

export default ComportementPage;
