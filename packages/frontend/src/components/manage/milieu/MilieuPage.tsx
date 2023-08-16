import { type EnvironmentExtended } from "@ou-ca/common/entities/environment";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import MilieuDeleteDialog from "./MilieuDeleteDialog";
import MilieuTable from "./MilieuTable";

const MilieuPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [environmentToDelete, setEnvironmentToDelete] = useState<EnvironmentExtended | null>(null);

  const { mutate: generateExport } = useApiExportEntities({ filename: t("environments") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/environments" });
  };

  const handleDeleteEnvironment = (environmentToDelete: EnvironmentExtended) => {};

  return (
    <>
      <ManageTopBar title={t("environments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MilieuTable onClickUpdateEnvironment={handleUpdateClick} />
      </ContentContainerLayout>
      <MilieuDeleteDialog
        environmentToDelete={environmentToDelete}
        onCancelDeletion={() => setEnvironmentToDelete(null)}
        onConfirmDeletion={handleDeleteEnvironment}
      />
    </>
  );
};

export default MilieuPage;
