import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import { type BehaviorsOrderBy, type UpsertBehaviorInput, upsertBehaviorResponse } from "@ou-ca/common/api/behavior";
import type { Behavior } from "@ou-ca/common/api/entities/behavior";
import { useApiBehaviorsInfiniteQuery } from "@services/api/behavior/api-behavior-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useQueryClient } from "@tanstack/react-query";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import ComportementCreate from "./ComportementCreate";
import ComportementDeleteDialog from "./ComportementDeleteDialog";
import ComportementTable from "./ComportementTable";
import ComportementUpdate from "./ComportementUpdate";

const ComportementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertBehaviorDialog, setUpsertBehaviorDialog] = useState<
    null | { mode: "create" } | { mode: "update"; behavior: Behavior }
  >(null);
  const [behaviorToDelete, setBehaviorToDelete] = useState<Behavior | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<BehaviorsOrderBy>({
    orderBy: "code",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiBehaviorsInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: BehaviorsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const handleUpsertBehaviorError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("behaviorAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { mutate: createBehavior } = useApiMutation(
    {
      path: "/behaviors",
      method: "POST",
      schema: upsertBehaviorResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "behaviorTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertBehaviorDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("behaviorAlreadyExistingError"),
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

  const { mutate: updateBehavior } = useApiMutation(
    {
      method: "PUT",
      schema: upsertBehaviorResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "behaviorTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertBehaviorDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("behaviorAlreadyExistingError"),
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

  const { mutate: deleteBehavior } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "behaviorTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setBehaviorToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const downloadExport = useApiDownloadExport({ filename: t("behaviors"), path: "/generate-export/behaviors" });

  const handleCreateClick = () => {
    setUpsertBehaviorDialog({ mode: "create" });
  };

  const handleUpdateClick = (behavior: Behavior) => {
    setUpsertBehaviorDialog({ mode: "update", behavior });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateBehavior = (input: UpsertBehaviorInput) => {
    createBehavior({ body: input });
  };

  const handleUpdateBehavior = (id: string, input: UpsertBehaviorInput) => {
    updateBehavior({ path: `/behaviors/${id}`, body: input });
  };

  const handleDeleteBehavior = (behaviorToDelete: Behavior) => {
    deleteBehavior({ path: `/behaviors/${behaviorToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("behaviors")}
        enableCreate={user?.permissions.behavior.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <ComportementTable
          behaviors={data?.flatMap((page) => page.data)}
          onClickUpdateBehavior={handleUpdateClick}
          onClickDeleteBehavior={setBehaviorToDelete}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertBehaviorDialog != null}
        onClose={() => setUpsertBehaviorDialog(null)}
        title={
          upsertBehaviorDialog?.mode === "create"
            ? t("behaviorCreationTitle")
            : upsertBehaviorDialog?.mode === "update"
              ? t("behaviorEditionTitle")
              : undefined
        }
      >
        {upsertBehaviorDialog?.mode === "create" && (
          <ComportementCreate onCancel={() => setUpsertBehaviorDialog(null)} onSubmit={handleCreateBehavior} />
        )}
        {upsertBehaviorDialog?.mode === "update" && (
          <ComportementUpdate
            behavior={upsertBehaviorDialog.behavior}
            onCancel={() => setUpsertBehaviorDialog(null)}
            onSubmit={handleUpdateBehavior}
          />
        )}
      </EntityUpsertDialog>
      <ComportementDeleteDialog
        behaviorToDelete={behaviorToDelete}
        onCancelDeletion={() => setBehaviorToDelete(null)}
        onConfirmDeletion={handleDeleteBehavior}
      />
    </>
  );
};

export default ComportementPage;
