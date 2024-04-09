import { useUser } from "@hooks/useUser";
import type { Species, SpeciesExtended } from "@ou-ca/common/api/entities/species";
import { type UpsertSpeciesInput, upsertSpeciesResponse } from "@ou-ca/common/api/species";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import EspeceCreate from "./EspeceCreate";
import EspeceDeleteDialog from "./EspeceDeleteDialog";
import EspeceTable from "./EspeceTable";
import EspeceUpdate from "./EspeceUpdate";

const EspecePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertSpeciesDialog, setUpsertSpeciesDialog] = useState<
    null | { mode: "create" } | { mode: "update"; species: Species }
  >(null);
  const [speciesToDelete, setSpeciesToDelete] = useState<SpeciesExtended | null>(null);

  const { mutate: createSpecies } = useApiMutation(
    {
      path: "/species",
      method: "POST",
      schema: upsertSpeciesResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesAlreadyExistingError"),
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

  const { mutate: updateSpecies } = useApiMutation(
    {
      method: "PUT",
      schema: upsertSpeciesResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesAlreadyExistingError"),
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

  const { mutate: deleteSpecies } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setSpeciesToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("species") });

  const handleCreateClick = () => {
    setUpsertSpeciesDialog({ mode: "create" });
  };

  const handleUpdateClick = (species: Species) => {
    setUpsertSpeciesDialog({ mode: "update", species });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/species" });
  };

  const handleCreateSpecies = (input: UpsertSpeciesInput) => {
    createSpecies({ body: input });
  };

  const handleUpdateSpecies = (id: string, input: UpsertSpeciesInput) => {
    updateSpecies({ path: `/species/${id}`, body: input });
  };

  const handleDeleteSpecies = (speciesToDelete: SpeciesExtended) => {
    deleteSpecies({ path: `/species/${speciesToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("species")}
        enableCreate={user?.permissions.species.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />

      <ContentContainerLayout>
        <EspeceTable onClickUpdateSpecies={handleUpdateClick} onClickDeleteSpecies={setSpeciesToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSpeciesDialog != null}
        onClose={() => setUpsertSpeciesDialog(null)}
        title={
          upsertSpeciesDialog?.mode === "create"
            ? t("speciesCreationTitle")
            : upsertSpeciesDialog?.mode === "update"
              ? t("speciesEditionTitle")
              : undefined
        }
      >
        {upsertSpeciesDialog?.mode === "create" && (
          <EspeceCreate onCancel={() => setUpsertSpeciesDialog(null)} onSubmit={handleCreateSpecies} />
        )}
        {upsertSpeciesDialog?.mode === "update" && (
          <EspeceUpdate
            species={upsertSpeciesDialog.species}
            onCancel={() => setUpsertSpeciesDialog(null)}
            onSubmit={handleUpdateSpecies}
          />
        )}
      </EntityUpsertDialog>
      <EspeceDeleteDialog
        speciesToDelete={speciesToDelete}
        onCancelDeletion={() => setSpeciesToDelete(null)}
        onConfirmDeletion={handleDeleteSpecies}
      />
    </>
  );
};

export default EspecePage;
