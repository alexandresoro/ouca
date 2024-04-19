import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Sex } from "@ou-ca/common/api/entities/sex";
import { type UpsertSexInput, upsertSexResponse } from "@ou-ca/common/api/sex";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useApiSexesInfiniteQuery } from "@services/api/sex/api-sex-queries";
import { useQueryClient } from "@tanstack/react-query";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import SexeCreate from "./SexeCreate";
import SexeDeleteDialog from "./SexeDeleteDialog";
import SexeTable from "./SexeTable";
import SexeUpdate from "./SexeUpdate";

const SexePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertSexDialog, setUpsertSexDialog] = useState<null | { mode: "create" } | { mode: "update"; sex: Sex }>(
    null,
  );
  const [sexToDelete, setSexToDelete] = useState<Sex | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiSexesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: EntitiesWithLabelOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const handleUpsertSexError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("sexAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { mutate: createSex } = useApiMutation(
    {
      path: "/sexes",
      method: "POST",
      schema: upsertSexResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "sexTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSexDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("sexAlreadyExistingError"),
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

  const { mutate: updateSex } = useApiMutation(
    {
      method: "PUT",
      schema: upsertSexResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "sexTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSexDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("sexAlreadyExistingError"),
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

  const { mutate: deleteSex } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "sexTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setSexToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const downloadExport = useApiDownloadExport({
    filename: t("genders"),
    path: "/generate-export/sexes",
  });

  const handleCreateClick = () => {
    setUpsertSexDialog({ mode: "create" });
  };

  const handleUpdateClick = (sex: Sex) => {
    setUpsertSexDialog({ mode: "update", sex });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateSex = (input: UpsertSexInput) => {
    createSex({ body: input });
  };

  const handleUpdateSex = (id: string, input: UpsertSexInput) => {
    updateSex({ path: `/sexes/${id}`, body: input });
  };

  const handleDeleteSex = (sexToDelete: Sex) => {
    deleteSex({ path: `/sexes/${sexToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("genders")}
        enableCreate={user?.permissions.sex.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <SexeTable onClickUpdateSex={handleUpdateClick} onClickDeleteSex={setSexToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSexDialog != null}
        onClose={() => setUpsertSexDialog(null)}
        title={
          upsertSexDialog?.mode === "create"
            ? t("sexCreationTitle")
            : upsertSexDialog?.mode === "update"
              ? t("sexEditionTitle")
              : undefined
        }
      >
        {upsertSexDialog?.mode === "create" && (
          <SexeCreate onCancel={() => setUpsertSexDialog(null)} onSubmit={handleCreateSex} />
        )}
        {upsertSexDialog?.mode === "update" && (
          <SexeUpdate sex={upsertSexDialog.sex} onCancel={() => setUpsertSexDialog(null)} onSubmit={handleUpdateSex} />
        )}
      </EntityUpsertDialog>
      <SexeDeleteDialog
        sexToDelete={sexToDelete}
        onCancelDeletion={() => setSexToDelete(null)}
        onConfirmDeletion={handleDeleteSex}
      />
    </>
  );
};

export default SexePage;
