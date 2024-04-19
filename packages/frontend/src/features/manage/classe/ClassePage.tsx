import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import { type ClassesOrderBy, type UpsertClassInput, upsertClassResponse } from "@ou-ca/common/api/species-class";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useApiSpeciesClassesInfiniteQuery } from "@services/api/species-class/api-species-class-queries";
import { useQueryClient } from "@tanstack/react-query";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import ClasseCreate from "./ClasseCreate";
import ClasseDeleteDialog from "./ClasseDeleteDialog";
import ClasseTable from "./ClasseTable";
import ClasseUpdate from "./ClasseUpdate";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertSpeciesClassDialog, setUpsertSpeciesClassDialog] = useState<
    null | { mode: "create" } | { mode: "update"; speciesClass: SpeciesClass }
  >(null);
  const [speciesClassToDelete, setSpeciesClassToDelete] = useState<SpeciesClass | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<ClassesOrderBy>({
    orderBy: "libelle",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiSpeciesClassesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: ClassesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const handleUpsertSpeciesError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("speciesClassAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { mutate: createSpeciesClass } = useApiMutation(
    {
      path: "/classes",
      method: "POST",
      schema: upsertClassResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesClassTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesClassDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesClassAlreadyExistingError"),
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

  const { mutate: updateSpeciesClass } = useApiMutation(
    {
      method: "PUT",
      schema: upsertClassResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesClassTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesClassDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesClassAlreadyExistingError"),
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

  const { mutate: deleteSpeciesClass } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesClassTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setSpeciesClassToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const downloadExport = useApiDownloadExport({ filename: t("speciesClasses"), path: "/generate-export/classes" });

  const handleCreateClick = () => {
    setUpsertSpeciesClassDialog({ mode: "create" });
  };

  const handleUpdateClick = (speciesClass: SpeciesClass) => {
    setUpsertSpeciesClassDialog({ mode: "update", speciesClass });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateSpeciesClass = (input: UpsertClassInput) => {
    createSpeciesClass({ body: input });
  };

  const handleUpdateSpeciesClass = (id: string, input: UpsertClassInput) => {
    updateSpeciesClass({ path: `/classes/${id}`, body: input });
  };

  const handleDeleteSpeciesClass = (speciesClassToDelete: SpeciesClass) => {
    deleteSpeciesClass({ path: `/classes/${speciesClassToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("speciesClasses")}
        enableCreate={user?.permissions.speciesClass.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <ClasseTable
          speciesClasses={data?.flatMap((page) => page.data)}
          onClickUpdateSpeciesClass={handleUpdateClick}
          onClickDeleteSpeciesClass={setSpeciesClassToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSpeciesClassDialog != null}
        onClose={() => setUpsertSpeciesClassDialog(null)}
        title={
          upsertSpeciesClassDialog?.mode === "create"
            ? t("speciesClassCreationTitle")
            : upsertSpeciesClassDialog?.mode === "update"
              ? t("speciesClassEditionTitle")
              : undefined
        }
      >
        {upsertSpeciesClassDialog?.mode === "create" && (
          <ClasseCreate onCancel={() => setUpsertSpeciesClassDialog(null)} onSubmit={handleCreateSpeciesClass} />
        )}
        {upsertSpeciesClassDialog?.mode === "update" && (
          <ClasseUpdate
            speciesClass={upsertSpeciesClassDialog.speciesClass}
            onCancel={() => setUpsertSpeciesClassDialog(null)}
            onSubmit={handleUpdateSpeciesClass}
          />
        )}
      </EntityUpsertDialog>
      <ClasseDeleteDialog
        speciesClassToDelete={speciesClassToDelete}
        onCancelDeletion={() => setSpeciesClassToDelete(null)}
        onConfirmDeletion={handleDeleteSpeciesClass}
      />
    </>
  );
};

export default ClassePage;
