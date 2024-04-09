import { useUser } from "@hooks/useUser";
import type { Environment, EnvironmentExtended } from "@ou-ca/common/api/entities/environment";
import { type UpsertEnvironmentInput, upsertEnvironmentResponse } from "@ou-ca/common/api/environment";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import MilieuCreate from "./MilieuCreate";
import MilieuDeleteDialog from "./MilieuDeleteDialog";
import MilieuTable from "./MilieuTable";
import MilieuUpdate from "./MilieuUpdate";

const MilieuPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertEnvironmentDialog, setUpsertEnvironmentDialog] = useState<
    null | { mode: "create" } | { mode: "update"; environment: Environment }
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
    },
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
    },
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
    },
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("environments") });

  const handleCreateClick = () => {
    setUpsertEnvironmentDialog({ mode: "create" });
  };

  const handleUpdateClick = (environment: Environment) => {
    setUpsertEnvironmentDialog({ mode: "update", environment });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/environments" });
  };

  const handleCreateEnvironment = (input: UpsertEnvironmentInput) => {
    createEnvironment({ body: input });
  };

  const handleUpdateEnvironment = (id: string, input: UpsertEnvironmentInput) => {
    updateEnvironment({ path: `/environments/${id}`, body: input });
  };

  const handleDeleteEnvironment = (environmentToDelete: EnvironmentExtended) => {
    deleteEnvironment({ path: `/environments/${environmentToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("environments")}
        enableCreate={user?.permissions.environment.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <MilieuTable onClickUpdateEnvironment={handleUpdateClick} onClickDeleteEnvironment={setEnvironmentToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertEnvironmentDialog != null}
        onClose={() => setUpsertEnvironmentDialog(null)}
        title={
          upsertEnvironmentDialog?.mode === "create"
            ? t("environmentCreationTitle")
            : upsertEnvironmentDialog?.mode === "update"
              ? t("environmentEditionTitle")
              : undefined
        }
      >
        {upsertEnvironmentDialog?.mode === "create" && (
          <MilieuCreate onCancel={() => setUpsertEnvironmentDialog(null)} onSubmit={handleCreateEnvironment} />
        )}
        {upsertEnvironmentDialog?.mode === "update" && (
          <MilieuUpdate
            environment={upsertEnvironmentDialog.environment}
            onCancel={() => setUpsertEnvironmentDialog(null)}
            onSubmit={handleUpdateEnvironment}
          />
        )}
      </EntityUpsertDialog>
      <MilieuDeleteDialog
        environmentToDelete={environmentToDelete}
        onCancelDeletion={() => setEnvironmentToDelete(null)}
        onConfirmDeletion={handleDeleteEnvironment}
      />
    </>
  );
};

export default MilieuPage;
