import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import { type UpsertAgeInput, upsertAgeResponse } from "@ou-ca/common/api/age";
import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Age } from "@ou-ca/common/api/entities/age";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import AgeCreate from "./AgeCreate";
import AgeDeleteDialog from "./AgeDeleteDialog";
import AgeTable from "./AgeTable";
import AgeUpdate from "./AgeUpdate";

const AgePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertAgeDialog, setUpsertAgeDialog] = useState<null | { mode: "create" } | { mode: "update"; age: Age }>(
    null,
  );
  const [ageToDelete, setAgeToDelete] = useState<Age | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { mutate: createAge } = useApiMutation(
    {
      path: "/ages",
      method: "POST",
      schema: upsertAgeResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "ageTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertAgeDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("ageAlreadyExistingError"),
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

  const { mutate: updateAge } = useApiMutation(
    {
      method: "PUT",
      schema: upsertAgeResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "ageTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertAgeDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("ageAlreadyExistingError"),
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

  const { mutate: deleteAge } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "ageTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setAgeToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const downloadExport = useApiDownloadExport({ filename: t("ages"), path: "/generate-export/ages" });

  const handleCreateClick = () => {
    setUpsertAgeDialog({ mode: "create" });
  };

  const handleUpdateClick = (age: Age) => {
    setUpsertAgeDialog({ mode: "update", age });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateAge = (input: UpsertAgeInput) => {
    createAge({ body: input });
  };

  const handleUpdateAge = (id: string, input: UpsertAgeInput) => {
    updateAge({ path: `/ages/${id}`, body: input });
  };

  const handleDeleteAge = (ageToDelete: Age) => {
    deleteAge({ path: `/ages/${ageToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("ages")}
        enableCreate={user?.permissions.age.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <AgeTable onClickUpdateAge={handleUpdateClick} onClickDeleteAge={setAgeToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertAgeDialog != null}
        onClose={() => setUpsertAgeDialog(null)}
        title={
          upsertAgeDialog?.mode === "create"
            ? t("ageCreationTitle")
            : upsertAgeDialog?.mode === "update"
              ? t("ageEditionTitle")
              : undefined
        }
      >
        {upsertAgeDialog?.mode === "create" && (
          <AgeCreate onCancel={() => setUpsertAgeDialog(null)} onSubmit={handleCreateAge} />
        )}
        {upsertAgeDialog?.mode === "update" && (
          <AgeUpdate age={upsertAgeDialog.age} onCancel={() => setUpsertAgeDialog(null)} onSubmit={handleUpdateAge} />
        )}
      </EntityUpsertDialog>
      <AgeDeleteDialog
        ageToDelete={ageToDelete}
        onCancelDeletion={() => setAgeToDelete(null)}
        onConfirmDeletion={handleDeleteAge}
      />
    </>
  );
};

export default AgePage;
