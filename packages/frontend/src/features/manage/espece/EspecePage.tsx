import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { Species } from "@ou-ca/common/api/entities/species";
import { type SpeciesOrderBy, type UpsertSpeciesInput, upsertSpeciesResponse } from "@ou-ca/common/api/species";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
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

  const { displayNotification } = useNotifications();

  const [upsertSpeciesDialog, setUpsertSpeciesDialog] = useState<
    null | { mode: "create" } | { mode: "update"; species: Species }
  >(null);
  const [speciesToDelete, setSpeciesToDelete] = useState<Species | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<SpeciesOrderBy>({
    orderBy: "nomFrancais",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

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

  const downloadExport = useApiDownloadExport({ filename: t("species"), path: "/generate-export/species" });

  const handleCreateClick = () => {
    setUpsertSpeciesDialog({ mode: "create" });
  };

  const handleUpdateClick = (species: Species) => {
    setUpsertSpeciesDialog({ mode: "update", species });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateSpecies = (input: UpsertSpeciesInput) => {
    createSpecies({ body: input });
  };

  const handleUpdateSpecies = (id: string, input: UpsertSpeciesInput) => {
    updateSpecies({ path: `/species/${id}`, body: input });
  };

  const handleDeleteSpecies = (speciesToDelete: Species) => {
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
