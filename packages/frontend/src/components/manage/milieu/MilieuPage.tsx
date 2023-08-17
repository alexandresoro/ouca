import { upsertEnvironmentResponse } from "@ou-ca/common/api/environment";
import { type EnvironmentExtended } from "@ou-ca/common/entities/environment";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
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

  const [upsertEnvironmentDialog, setUpsertEnvironmentDialog] = useState<
    null | { mode: "create" } | { mode: "update"; id: string }
  >(null);
  const [environmentToDelete, setEnvironmentToDelete] = useState<EnvironmentExtended | null>(null);

  const { mutate: createEnvironment } = useApiMutation(
    {
      path: "/environments",
      method: "POST",
      schema: upsertEnvironmentResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "environmentTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertEnvironmentDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("environmentAlreadyExistingError"),
          });
        } else {
          displayNotification({
            type: "error",
            message: t("retrieveGenericSaveError"),
          });
        }
      },
    }
  );

  const { mutate: updateEnvironment } = useApiMutation(
    {
      method: "PUT",
      schema: upsertEnvironmentResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "environmentTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertEnvironmentDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("environmentAlreadyExistingError"),
          });
        } else {
          displayNotification({
            type: "error",
            message: t("retrieveGenericSaveError"),
          });
        }
      },
    }
  );

  const { mutate: deleteEnvironment } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "environmentTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setEnvironmentToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("environments") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/environments" });
  };

  const handleDeleteEnvironment = (environmentToDelete: EnvironmentExtended) => {
    deleteEnvironment({ path: `/environments/${environmentToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("environments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MilieuTable onClickUpdateEnvironment={handleUpdateClick} onClickDeleteEnvironment={setEnvironmentToDelete} />
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
