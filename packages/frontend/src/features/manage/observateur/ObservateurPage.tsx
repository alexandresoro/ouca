import { type Observer } from "@ou-ca/common/api/entities/observer";
import { type UpsertObserverInput } from "@ou-ca/common/api/observer";
import {
  useApiObserverCreate,
  useApiObserverDelete,
  useApiObserverUpdate,
} from "@services/api/observer/api-observer-queries";
import { useQueryClient } from "@tanstack/react-query";
import { FetchError } from "@utils/fetch-api";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurCreate from "./ObservateurCreate";
import ObservateurDeleteDialog from "./ObservateurDeleteDialog";
import ObservateurTable from "./ObservateurTable";
import ObservateurUpdate from "./ObservateurUpdate";

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertObserverDialog, setUpsertObserverDialog] = useState<
    null | { mode: "create" } | { mode: "update"; observer: Observer }
  >(null);
  const [observerToDelete, setObserverToDelete] = useState<Observer | null>(null);

  const createObserver = useApiObserverCreate();

  const { trigger: updateObserver2 } = useApiObserverUpdate(
    upsertObserverDialog?.mode === "update" ? upsertObserverDialog.observer?.id : null,
    {
      onSuccess: () => {
        // Since an update can change the sort order, we need to invalidate the table
        void queryClient.invalidateQueries(["API", "observerTable"]);

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertObserverDialog(null);
      },
      onError: (e) => {
        // Since an update can change the sort order, we need to invalidate the table
        void queryClient.invalidateQueries(["API", "observerTable"]);

        if (e instanceof FetchError && e.status === 409) {
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

  const { trigger: deleteObserver } = useApiObserverDelete(observerToDelete?.id ?? null, {
    onSuccess: () => {
      void queryClient.invalidateQueries(["API", "observerTable"]);

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setObserverToDelete(null);
    },
    onError: () => {
      void queryClient.invalidateQueries(["API", "observerTable"]);

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const { mutate: generateExport } = useApiExportEntities({ filename: t("observer") });

  const handleCreateClick = () => {
    setUpsertObserverDialog({ mode: "create" });
  };

  const handleUpdateClick = (observer: Observer) => {
    setUpsertObserverDialog({ mode: "update", observer });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/observers" });
  };

  const handleCreateObserver = (input: UpsertObserverInput) => {
    createObserver({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertObserverDialog(null);
      })
      .catch((e) => {
        if (e instanceof FetchError && e.status === 409) {
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
      })
      .finally(() => {
        void queryClient.invalidateQueries(["API", "observerTable"]);
      });
  };

  const handleUpdateObserver = (id: string, input: UpsertObserverInput) => {
    void updateObserver2({ body: input });
  };

  const handleDeleteObserver = () => {
    void deleteObserver();
  };

  return (
    <>
      <ManageTopBar title={t("observers")} onClickCreate={handleCreateClick} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ObservateurTable onClickUpdateObserver={handleUpdateClick} onClickDeleteObserver={setObserverToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertObserverDialog != null}
        onClose={() => setUpsertObserverDialog(null)}
        title={
          upsertObserverDialog?.mode === "create"
            ? t("observerCreationTitle")
            : upsertObserverDialog?.mode === "update"
              ? t("observerEditionTitle")
              : undefined
        }
      >
        {upsertObserverDialog?.mode === "create" && (
          <ObservateurCreate onCancel={() => setUpsertObserverDialog(null)} onSubmit={handleCreateObserver} />
        )}
        {upsertObserverDialog?.mode === "update" && (
          <ObservateurUpdate
            observer={upsertObserverDialog.observer}
            onCancel={() => setUpsertObserverDialog(null)}
            onSubmit={handleUpdateObserver}
          />
        )}
      </EntityUpsertDialog>
      <ObservateurDeleteDialog
        observerToDelete={observerToDelete}
        onCancelDeletion={() => setObserverToDelete(null)}
        onConfirmDeletion={handleDeleteObserver}
      />
    </>
  );
};

export default ObservateurPage;
