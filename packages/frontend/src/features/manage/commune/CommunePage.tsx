import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { Town } from "@ou-ca/common/api/entities/town";
import { type TownsOrderBy, type UpsertTownInput, upsertTownResponse } from "@ou-ca/common/api/town";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import CommuneCreate from "./CommuneCreate";
import CommuneDeleteDialog from "./CommuneDeleteDialog";
import CommuneTable from "./CommuneTable";
import CommuneUpdate from "./CommuneUpdate";

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertTownDialog, setUpsertTownDialog] = useState<null | { mode: "create" } | { mode: "update"; town: Town }>(
    null,
  );
  const [townToDelete, setTownToDelete] = useState<Town | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<TownsOrderBy>({
    orderBy: "nom",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const handleRequestSort = (sortingColumn: TownsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const { mutate: createTown } = useApiMutation(
    {
      path: "/towns",
      method: "POST",
      schema: upsertTownResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "townTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertTownDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("townAlreadyExistingError"),
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

  const { mutate: updateTown } = useApiMutation(
    {
      method: "PUT",
      schema: upsertTownResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "townTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertTownDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("townAlreadyExistingError"),
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

  const { mutate: deleteTown } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "townTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setTownToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const downloadExport = useApiDownloadExport({ filename: t("towns"), path: "/generate-export/towns" });

  const handleCreateClick = () => {
    setUpsertTownDialog({ mode: "create" });
  };

  const handleUpdateClick = (town: Town) => {
    setUpsertTownDialog({ mode: "update", town });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateTown = (input: UpsertTownInput) => {
    createTown({ body: input });
  };

  const handleUpdateTown = (id: string, input: UpsertTownInput) => {
    updateTown({ path: `/towns/${id}`, body: input });
  };

  const handleDeleteTown = (townToDelete: Town) => {
    deleteTown({ path: `/towns/${townToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("towns")}
        enableCreate={user?.permissions.town.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <CommuneTable onClickUpdateTown={handleUpdateClick} onClickDeleteTown={setTownToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertTownDialog != null}
        onClose={() => setUpsertTownDialog(null)}
        title={
          upsertTownDialog?.mode === "create"
            ? t("townCreationTitle")
            : upsertTownDialog?.mode === "update"
              ? t("townEditionTitle")
              : undefined
        }
      >
        {upsertTownDialog?.mode === "create" && (
          <CommuneCreate onCancel={() => setUpsertTownDialog(null)} onSubmit={handleCreateTown} />
        )}
        {upsertTownDialog?.mode === "update" && (
          <CommuneUpdate
            town={upsertTownDialog.town}
            onCancel={() => setUpsertTownDialog(null)}
            onSubmit={handleUpdateTown}
          />
        )}
      </EntityUpsertDialog>
      <CommuneDeleteDialog
        townToDelete={townToDelete}
        onCancelDeletion={() => setTownToDelete(null)}
        onConfirmDeletion={handleDeleteTown}
      />
    </>
  );
};

export default CommunePage;
