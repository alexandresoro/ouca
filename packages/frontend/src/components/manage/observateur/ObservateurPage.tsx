import { upsertObserverResponse, type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { type ObserverExtended } from "@ou-ca/common/entities/observer";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurDeleteDialog from "./ObservateurDeleteDialog";
import ObservateurTable from "./ObservateurTable";

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertObserverDialog, setUpsertObserverDialog] = useState<
    null | { mode: "create" } | { mode: "update"; id: string }
  >(null);
  const [observerToDelete, setObserverToDelete] = useState<ObserverExtended | null>(null);

  const { mutate: createObserver } = useApiMutation(
    {
      path: "/observers",
      method: "POST",
      schema: upsertObserverResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "observerTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertObserverDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("observerAlreadyExistingError"),
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

  const { mutate: updateObserver } = useApiMutation(
    {
      method: "PUT",
      schema: upsertObserverResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "observerTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertObserverDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("observerAlreadyExistingError"),
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

  const { mutate: deleteObserver } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "observerTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setObserverToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("observer") });

  const handleCreateClick = () => {
    setUpsertObserverDialog({ mode: "create" });
  };

  const handleUpdateClick = (id: string) => {
    setUpsertObserverDialog({ mode: "update", id });
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/observers" });
  };

  const handleCreateObserver = () => {
    createObserver({});
  };

  const handleUpdateObserver = (id: string, input: UpsertObserverInput) => {
    updateObserver({ path: `/observers/${id}`, body: input });
  };

  const handleDeleteObserver = (observerToDelete: ObserverExtended) => {
    deleteObserver({ path: `/observers/${observerToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("observers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ObservateurTable onClickUpdateObserver={handleUpdateClick} onClickDeleteObserver={setObserverToDelete} />
      </ContentContainerLayout>
      <ObservateurDeleteDialog
        observerToDelete={observerToDelete}
        onCancelDeletion={() => setObserverToDelete(null)}
        onConfirmDeletion={handleDeleteObserver}
      />
    </>
  );
};

export default ObservateurPage;
