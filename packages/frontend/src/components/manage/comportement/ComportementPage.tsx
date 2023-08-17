import { upsertBehaviorResponse, type UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { type BehaviorExtended } from "@ou-ca/common/entities/behavior";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import ComportementCreate from "./ComportementCreate";
import ComportementDeleteDialog from "./ComportementDeleteDialog";
import ComportementTable from "./ComportementTable";
import ComportementUpdate from "./ComportementUpdate";

const ComportementPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertBehaviorDialog, setUpsertBehaviorDialog] = useState<
    null | { mode: "create" } | { mode: "update"; id: string }
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
    }
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
    }
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
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("behaviors") });

  const handleCreateClick = () => {
    setUpsertBehaviorDialog({ mode: "create" });
  };

  const handleUpdateClick = (id: string) => {
    // setUpsertBehaviorDialog({ mode: "update", id });
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/behaviors" });
  };

  const handleCreateBehavior = () => {
    createBehavior({});
  };

  const handleUpdateBehavior = (id: string, input: UpsertBehaviorInput) => {
    updateBehavior({ path: `/behaviors/${id}`, body: input });
  };

  const handleDeleteBehavior = (behaviorToDelete: BehaviorExtended) => {
    deleteBehavior({ path: `/behaviors/${behaviorToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("behaviors")} onClickExport={handleExportClick} />
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
          <ComportementUpdate onCancel={() => setUpsertBehaviorDialog(null)} onSubmit={handleUpdateBehavior} />
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
