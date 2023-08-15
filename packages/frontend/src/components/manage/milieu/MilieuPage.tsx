import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import MilieuTable from "./MilieuTable";

const MilieuPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("environments") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/environments" });
  };

  return (
    <>
      <ManageTopBar title={t("environments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MilieuTable onClickUpdateEnvironment={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default MilieuPage;
