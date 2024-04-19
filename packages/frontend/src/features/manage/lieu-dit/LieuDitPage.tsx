import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { Locality } from "@ou-ca/common/api/entities/locality";
import { type LocalitiesOrderBy, type UpsertLocalityInput, upsertLocalityResponse } from "@ou-ca/common/api/locality";
import { getTownResponse } from "@ou-ca/common/api/town";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useApiLocalitiesInfiniteQuery } from "@services/api/locality/api-locality-queries";
import { useApiFetch } from "@services/api/useApiFetch";
import { useQueryClient } from "@tanstack/react-query";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import LieuDitCreate from "./LieuDitCreate";
import LieuDitDeleteDialog from "./LieuDitDeleteDialog";
import LieuDitTable from "./LieuDitTable";
import LieuDitUpdate from "./LieuDitUpdate";

const LieuDitPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertLocalityDialog, setUpsertLocalityDialog] = useState<
    null | { mode: "create" } | { mode: "update"; locality: Locality; departmentId: string }
  >(null);
  const [localityToDelete, setLocalityToDelete] = useState<Locality | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<LocalitiesOrderBy>({
    orderBy: "nom",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiLocalitiesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: LocalitiesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const handleUpsertLocalityError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("localityAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const fetchTown = useApiFetch({
    schema: getTownResponse,
  });

  const { mutate: createLocality } = useApiMutation(
    {
      path: "/localities",
      method: "POST",
      schema: upsertLocalityResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "localityTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertLocalityDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("localityAlreadyExistingError"),
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

  const { mutate: updateLocality } = useApiMutation(
    {
      method: "PUT",
      schema: upsertLocalityResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "localityTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertLocalityDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("localityAlreadyExistingError"),
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

  const { mutate: deleteLocality } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "localityTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setLocalityToDelete(null);
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
    filename: t("localities"),
    path: "/generate-export/localities",
  });

  const handleCreateClick = () => {
    setUpsertLocalityDialog({ mode: "create" });
  };

  const handleUpdateClick = async (locality: Locality) => {
    const townOfLocality = await fetchTown({
      path: `/towns/${locality.townId}`,
    }).catch(() => {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
      throw new Error("Error while fetching town of locality.");
    });

    setUpsertLocalityDialog({ mode: "update", locality, departmentId: townOfLocality.departmentId });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateLocality = (input: UpsertLocalityInput) => {
    createLocality({ body: input });
  };

  const handleUpdateLocality = (id: string, input: UpsertLocalityInput) => {
    updateLocality({ path: `/localities/${id}`, body: input });
  };

  const handleDeleteLocality = (localityToDelete: Locality) => {
    deleteLocality({ path: `/localities/${localityToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("localities")}
        enableCreate={user?.permissions.locality.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <LieuDitTable onClickUpdateLocality={handleUpdateClick} onClickDeleteLocality={setLocalityToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertLocalityDialog != null}
        onClose={() => setUpsertLocalityDialog(null)}
        title={
          upsertLocalityDialog?.mode === "create"
            ? t("localityCreationTitle")
            : upsertLocalityDialog?.mode === "update"
              ? t("localityEditionTitle")
              : undefined
        }
      >
        {upsertLocalityDialog?.mode === "create" && (
          <LieuDitCreate onCancel={() => setUpsertLocalityDialog(null)} onSubmit={handleCreateLocality} />
        )}
        {upsertLocalityDialog?.mode === "update" && (
          <LieuDitUpdate
            locality={upsertLocalityDialog.locality}
            selectedDepartmentId={upsertLocalityDialog.departmentId}
            onCancel={() => setUpsertLocalityDialog(null)}
            onSubmit={handleUpdateLocality}
          />
        )}
      </EntityUpsertDialog>
      <LieuDitDeleteDialog
        localityToDelete={localityToDelete}
        onCancelDeletion={() => setLocalityToDelete(null)}
        onConfirmDeletion={handleDeleteLocality}
      />
    </>
  );
};

export default LieuDitPage;
