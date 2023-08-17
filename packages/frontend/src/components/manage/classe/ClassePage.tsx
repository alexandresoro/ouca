import { upsertClassResponse } from "@ou-ca/common/api/species-class";
import { type SpeciesClassExtended } from "@ou-ca/common/entities/species-class";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ClasseDeleteDialog from "./ClasseDeleteDialog";
import ClasseTable from "./ClasseTable";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertSpeciesClassDialog, setUpsertSpeciesClassDialog] = useState<
    null | { mode: "create" } | { mode: "update"; id: string }
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

  const handleUpdateClick = (id: string) => {
    setUpsertSpeciesClassDialog({ mode: "update", id });
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/classes" });
  };

  const handleDeleteSpeciesClass = (speciesClassToDelete: SpeciesClassExtended) => {
    deleteSpeciesClass({ path: `/classes/${speciesClassToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("speciesClasses")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ClasseTable
          onClickUpdateSpeciesClass={handleUpdateClick}
          onClickDeleteSpeciesClass={setSpeciesClassToDelete}
        />
      </ContentContainerLayout>
      <ClasseDeleteDialog
        speciesClassToDelete={speciesClassToDelete}
        onCancelDeletion={() => setSpeciesClassToDelete(null)}
        onConfirmDeletion={handleDeleteSpeciesClass}
      />
    </>
  );
};

export default ClassePage;
