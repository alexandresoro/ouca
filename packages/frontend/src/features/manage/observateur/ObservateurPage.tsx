import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Observer } from "@ou-ca/common/api/entities/observer";
import type { UpsertObserverInput } from "@ou-ca/common/api/observer";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiObserverCreate,
  useApiObserverDelete,
  useApiObserverUpdate,
  useApiObserversInfiniteQuery,
} from "@services/api/observer/api-observer-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurCreate from "./ObservateurCreate";
import ObservateurDeleteDialog from "./ObservateurDeleteDialog";
import ObservateurTable from "./ObservateurTable";
import ObservateurUpdate from "./ObservateurUpdate";

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertObserverDialog, setUpsertObserverDialog] = useState<
    null | { mode: "create" } | { mode: "update"; observer: Observer }
  >(null);
  const [observerToDelete, setObserverToDelete] = useState<Observer | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const { data, fetchNextPage, hasNextPage, mutate } = useApiObserversInfiniteQuery({
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  });

  const handleRequestSort = (sortingColumn: EntitiesWithLabelOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createObserver = useApiObserverCreate();

  const handleUpsertObserverError = (e: unknown) => {
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
  };

  const { trigger: updateObserver } = useApiObserverUpdate(
    upsertObserverDialog?.mode === "update" ? upsertObserverDialog.observer?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertObserverDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertObserverError(e);
      },
    },
  );

  const { trigger: deleteObserver } = useApiObserverDelete(observerToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setObserverToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({
    filename: t("observer"),
    path: "/generate-export/observers",
  });

  const handleCreateClick = () => {
    setUpsertObserverDialog({ mode: "create" });
  };

  const handleUpdateClick = (observer: Observer) => {
    setUpsertObserverDialog({ mode: "update", observer });
  };

  const handleExportClick = () => {
    void downloadExport();
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
        handleUpsertObserverError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateObserver = (_id: string, input: UpsertObserverInput) => {
    void updateObserver({ body: input });
  };

  const handleDeleteObserver = () => {
    void deleteObserver();
  };

  return (
    <>
      <ManageTopBar
        title={t("observers")}
        enableCreate={user?.permissions.observer.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <ManageEntitiesHeader
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
          }}
          count={data?.[0].meta.count}
        />
        <ObservateurTable
          observers={data?.flatMap((page) => page.data)}
          handleRequestSort={handleRequestSort}
          onClickUpdateObserver={handleUpdateClick}
          onClickDeleteObserver={setObserverToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
        />
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
