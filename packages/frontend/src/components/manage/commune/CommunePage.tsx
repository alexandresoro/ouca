import { upsertTownResponse } from "@ou-ca/common/api/town";
import { type TownExtended } from "@ou-ca/common/entities/town";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import CommuneDeleteDialog from "./CommuneDeleteDialog";
import CommuneTable from "./CommuneTable";

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/towns" });
  };

  const handleDeleteTown = (townToDelete: TownExtended) => {
    deleteTown({ path: `/towns/${townToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("towns")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <CommuneTable onClickUpdateTown={handleUpdateClick} onClickDeleteTown={setTownToDelete} />
      </ContentContainerLayout>
      <CommuneDeleteDialog
        townToDelete={townToDelete}
        onCancelDeletion={() => setTownToDelete(null)}
        onConfirmDeletion={handleDeleteTown}
      />
    </>
  );
};

export default CommunePage;
