import { upsertClassResponse, type UpsertClassInput } from "@ou-ca/common/api/species-class";
import { type SpeciesClass, type SpeciesClassExtended } from "@ou-ca/common/entities/species-class";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import ClasseCreate from "./ClasseCreate";
import ClasseDeleteDialog from "./ClasseDeleteDialog";
import ClasseTable from "./ClasseTable";
import ClasseUpdate from "./ClasseUpdate";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertSpeciesClassDialog, setUpsertSpeciesClassDialog] = useState<
    null | { mode: "create" } | { mode: "update"; speciesClass: SpeciesClass }
  >(null);
  const [speciesClassToDelete, setSpeciesClassToDelete] = useState<SpeciesClassExtended | null>(null);

  const { mutate: createSpeciesClass } = useApiMutation(
    {
      path: "/classes",
      method: "POST",
      schema: upsertClassResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesClassTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesClassDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesClassAlreadyExistingError"),
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

  const { mutate: updateSpeciesClass } = useApiMutation(
    {
      method: "PUT",
      schema: upsertClassResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesClassTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesClassDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesClassAlreadyExistingError"),
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

  const { mutate: deleteSpeciesClass } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesClassTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setSpeciesClassToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("speciesClasses") });

  const handleCreateClick = () => {
    setUpsertSpeciesClassDialog({ mode: "create" });
  };

  const handleUpdateClick = (speciesClass: SpeciesClass) => {
    setUpsertSpeciesClassDialog({ mode: "update", speciesClass });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/classes" });
  };

  const handleCreateSpeciesClass = (input: UpsertClassInput) => {
    createSpeciesClass({ body: input });
  };

  const handleUpdateSpeciesClass = (id: string, input: UpsertClassInput) => {
    updateSpeciesClass({ path: `/classes/${id}`, body: input });
  };

  const handleDeleteSpeciesClass = (speciesClassToDelete: SpeciesClassExtended) => {
    deleteSpeciesClass({ path: `/classes/${speciesClassToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("speciesClasses")} onClickCreate={handleCreateClick} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ClasseTable
          onClickUpdateSpeciesClass={handleUpdateClick}
          onClickDeleteSpeciesClass={setSpeciesClassToDelete}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSpeciesClassDialog != null}
        onClose={() => setUpsertSpeciesClassDialog(null)}
        title={
          upsertSpeciesClassDialog?.mode === "create"
            ? t("speciesClassCreationTitle")
            : upsertSpeciesClassDialog?.mode === "update"
            ? t("speciesClassEditionTitle")
            : undefined
        }
      >
        {upsertSpeciesClassDialog?.mode === "create" && (
          <ClasseCreate onCancel={() => setUpsertSpeciesClassDialog(null)} onSubmit={handleCreateSpeciesClass} />
        )}
        {upsertSpeciesClassDialog?.mode === "update" && (
          <ClasseUpdate
            speciesClass={upsertSpeciesClassDialog.speciesClass}
            onCancel={() => setUpsertSpeciesClassDialog(null)}
            onSubmit={handleUpdateSpeciesClass}
          />
        )}
      </EntityUpsertDialog>
      <ClasseDeleteDialog
        speciesClassToDelete={speciesClassToDelete}
        onCancelDeletion={() => setSpeciesClassToDelete(null)}
        onConfirmDeletion={handleDeleteSpeciesClass}
      />
    </>
  );
};

export default ClassePage;
