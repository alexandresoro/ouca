import { useUser } from "@hooks/useUser";
import { type UpsertBehaviorInput, upsertBehaviorResponse } from "@ou-ca/common/api/behavior";
import type { Behavior, BehaviorExtended } from "@ou-ca/common/api/entities/behavior";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import ComportementCreate from "./ComportementCreate";
import ComportementDeleteDialog from "./ComportementDeleteDialog";
import ComportementTable from "./ComportementTable";
import ComportementUpdate from "./ComportementUpdate";

const ComportementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertBehaviorDialog, setUpsertBehaviorDialog] = useState<
    null | { mode: "create" } | { mode: "update"; behavior: Behavior }
  >(null);
  const [behaviorToDelete, setBehaviorToDelete] = useState<BehaviorExtended | null>(null);

  const { mutate: createBehavior } = useApiMutation(
    {
      path: "/behaviors",
      method: "POST",
      schema: upsertBehaviorResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "behaviorTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertBehaviorDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("behaviorAlreadyExistingError"),
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

  const { mutate: updateBehavior } = useApiMutation(
    {
      method: "PUT",
      schema: upsertBehaviorResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "behaviorTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertBehaviorDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("behaviorAlreadyExistingError"),
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

  const { mutate: deleteBehavior } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "behaviorTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setBehaviorToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("behaviors") });

  const handleCreateClick = () => {
    setUpsertBehaviorDialog({ mode: "create" });
  };

  const handleUpdateClick = (behavior: Behavior) => {
    setUpsertBehaviorDialog({ mode: "update", behavior });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/behaviors" });
  };

  const handleCreateBehavior = (input: UpsertBehaviorInput) => {
    createBehavior({ body: input });
  };

  const handleUpdateBehavior = (id: string, input: UpsertBehaviorInput) => {
    updateBehavior({ path: `/behaviors/${id}`, body: input });
  };

  const handleDeleteBehavior = (behaviorToDelete: Behavior) => {
    deleteBehavior({ path: `/behaviors/${behaviorToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("behaviors")}
        enableCreate={user?.permissions.behavior.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <ComportementTable onClickUpdateBehavior={handleUpdateClick} onClickDeleteBehavior={setBehaviorToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertBehaviorDialog != null}
        onClose={() => setUpsertBehaviorDialog(null)}
        title={
          upsertBehaviorDialog?.mode === "create"
            ? t("behaviorCreationTitle")
            : upsertBehaviorDialog?.mode === "update"
              ? t("behaviorEditionTitle")
              : undefined
        }
      >
        {upsertBehaviorDialog?.mode === "create" && (
          <ComportementCreate onCancel={() => setUpsertBehaviorDialog(null)} onSubmit={handleCreateBehavior} />
        )}
        {upsertBehaviorDialog?.mode === "update" && (
          <ComportementUpdate
            behavior={upsertBehaviorDialog.behavior}
            onCancel={() => setUpsertBehaviorDialog(null)}
            onSubmit={handleUpdateBehavior}
          />
        )}
      </EntityUpsertDialog>
      <ComportementDeleteDialog
        behaviorToDelete={behaviorToDelete}
        onCancelDeletion={() => setBehaviorToDelete(null)}
        onConfirmDeletion={handleDeleteBehavior}
      />
    </>
  );
};

export default ComportementPage;
