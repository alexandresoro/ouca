import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { type UpsertDistanceEstimateInput, upsertDistanceEstimateResponse } from "@ou-ca/common/api/distance-estimate";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { useApiDistanceEstimatesInfiniteQuery } from "@services/api/distance-estimate/api-distance-estimate-queries";
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
import EstimationDistanceCreate from "./EstimationDistanceCreate";
import EstimationDistanceDeleteDialog from "./EstimationDistanceDeleteDialog";
import EstimationDistanceTable from "./EstimationDistanceTable";
import EstimationDistanceUpdate from "./EstimationDistanceUpdate";

const EstimationDistancePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertDistanceEstimateDialog, setUpsertDistanceEstimateDialog] = useState<
    null | { mode: "create" } | { mode: "update"; distanceEstimate: DistanceEstimate }
  >(null);
  const [distanceEstimateToDelete, setDistanceEstimateToDelete] = useState<DistanceEstimate | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiDistanceEstimatesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: EntitiesWithLabelOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const handleUpsertDistanceEstimateError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("distancePrecisionAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { mutate: createDistanceEstimate } = useApiMutation(
    {
      path: "/distance-estimates",
      method: "POST",
      schema: upsertDistanceEstimateResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "distanceEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDistanceEstimateDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("distancePrecisionAlreadyExistingError"),
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

  const { mutate: updateDistanceEstimate } = useApiMutation(
    {
      method: "PUT",
      schema: upsertDistanceEstimateResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "distanceEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDistanceEstimateDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("distancePrecisionAlreadyExistingError"),
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

  const { mutate: deleteDistanceEstimate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "distanceEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setDistanceEstimateToDelete(null);
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
    filename: t("distancePrecisions"),
    path: "/generate-export/distance-estimates",
  });

  const handleCreateClick = () => {
    setUpsertDistanceEstimateDialog({ mode: "create" });
  };

  const handleUpdateClick = (distanceEstimate: DistanceEstimate) => {
    setUpsertDistanceEstimateDialog({ mode: "update", distanceEstimate });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateDistanceEstimate = (input: UpsertDistanceEstimateInput) => {
    createDistanceEstimate({ body: input });
  };

  const handleUpdateDistanceEstimate = (id: string, input: UpsertDistanceEstimateInput) => {
    updateDistanceEstimate({ path: `/distance-estimates/${id}`, body: input });
  };

  const handleDeleteDistanceEstimate = (distanceEstimateToDelete: DistanceEstimate) => {
    deleteDistanceEstimate({ path: `/distance-estimates/${distanceEstimateToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("distancePrecisions")}
        enableCreate={user?.permissions.distanceEstimate.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <EstimationDistanceTable
          onClickUpdateDistanceEstimate={handleUpdateClick}
          onClickDeleteDistanceEstimate={setDistanceEstimateToDelete}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertDistanceEstimateDialog != null}
        onClose={() => setUpsertDistanceEstimateDialog(null)}
        title={
          upsertDistanceEstimateDialog?.mode === "create"
            ? t("distancePrecisionCreationTitle")
            : upsertDistanceEstimateDialog?.mode === "update"
              ? t("distancePrecisionEditionTitle")
              : undefined
        }
      >
        {upsertDistanceEstimateDialog?.mode === "create" && (
          <EstimationDistanceCreate
            onCancel={() => setUpsertDistanceEstimateDialog(null)}
            onSubmit={handleCreateDistanceEstimate}
          />
        )}
        {upsertDistanceEstimateDialog?.mode === "update" && (
          <EstimationDistanceUpdate
            distanceEstimate={upsertDistanceEstimateDialog.distanceEstimate}
            onCancel={() => setUpsertDistanceEstimateDialog(null)}
            onSubmit={handleUpdateDistanceEstimate}
          />
        )}
      </EntityUpsertDialog>
      <EstimationDistanceDeleteDialog
        distanceEstimateToDelete={distanceEstimateToDelete}
        onCancelDeletion={() => setDistanceEstimateToDelete(null)}
        onConfirmDeletion={handleDeleteDistanceEstimate}
      />
    </>
  );
};

export default EstimationDistancePage;
