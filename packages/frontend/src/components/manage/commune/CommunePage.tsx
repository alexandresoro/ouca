import { upsertTownResponse, type UpsertTownInput } from "@ou-ca/common/api/town";
import { type TownExtended } from "@ou-ca/common/entities/town";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import CommuneCreate from "./CommuneCreate";
import CommuneDeleteDialog from "./CommuneDeleteDialog";
import CommuneTable from "./CommuneTable";
import CommuneUpdate from "./CommuneUpdate";

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertTownDialog, setUpsertTownDialog] = useState<null | { mode: "create" } | { mode: "update"; id: string }>(
    null
  );
  const [townToDelete, setTownToDelete] = useState<TownExtended | null>(null);

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
    }
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
    }
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
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("towns") });

  const handleCreateClick = () => {
    setUpsertTownDialog({ mode: "create" });
  };

  const handleUpdateClick = (id: string) => {
    setUpsertTownDialog({ mode: "update", id });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/towns" });
  };

  const handleCreateTown = (input: UpsertTownInput) => {
    createTown({ body: input });
  };

  const handleUpdateTown = (id: string, input: UpsertTownInput) => {
    updateTown({ path: `/towns/${id}`, body: input });
  };

  const handleDeleteTown = (townToDelete: TownExtended) => {
    deleteTown({ path: `/towns/${townToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("towns")} onClickCreate={handleCreateClick} onClickExport={handleExportClick} />
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
            id={upsertTownDialog.id}
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
