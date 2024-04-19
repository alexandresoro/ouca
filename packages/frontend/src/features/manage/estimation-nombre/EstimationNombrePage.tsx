import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import type { NumberEstimate } from "@ou-ca/common/api/entities/number-estimate";
import {
  type NumberEstimatesOrderBy,
  type UpsertNumberEstimateInput,
  upsertNumberEstimateResponse,
} from "@ou-ca/common/api/number-estimate";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useApiNumberEstimatesInfiniteQuery } from "@services/api/number-estimate/api-number-estimate-queries";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import EstimationNombreCreate from "./EstimationNombreCreate";
import EstimationNombreDeleteDialog from "./EstimationNombreDeleteDialog";
import EstimationNombreTable from "./EstimationNombreTable";
import EstimationNombreUpdate from "./EstimationNombreUpdate";

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertNumberEstimateDialog, setUpsertNumberEstimateDialog] = useState<
    null | { mode: "create" } | { mode: "update"; numberEstimate: NumberEstimate }
  >(null);
  const [numberEstimateToDelete, setNumberEstimateToDelete] = useState<NumberEstimate | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<NumberEstimatesOrderBy>(
    { orderBy: "libelle" },
  );

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiNumberEstimatesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: NumberEstimatesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const { mutate: createNumberEstimate } = useApiMutation(
    {
      path: "/number-estimates",
      method: "POST",
      schema: upsertNumberEstimateResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "numberEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertNumberEstimateDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("numberPrecisionAlreadyExistingError"),
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

  const { mutate: updateNumberEstimate } = useApiMutation(
    {
      method: "PUT",
      schema: upsertNumberEstimateResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "numberEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertNumberEstimateDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("numberPrecisionAlreadyExistingError"),
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

  const { mutate: deleteNumberEstimate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "numberEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setNumberEstimateToDelete(null);
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
    filename: t("numberPrecisions"),
    path: "/generate-export/number-estimates",
  });

  const handleCreateClick = () => {
    setUpsertNumberEstimateDialog({ mode: "create" });
  };

  const handleUpdateClick = (numberEstimate: NumberEstimate) => {
    setUpsertNumberEstimateDialog({ mode: "update", numberEstimate });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateNumberEstimate = (input: UpsertNumberEstimateInput) => {
    createNumberEstimate({ body: input });
  };

  const handleUpdateNumberEstimate = (id: string, input: UpsertNumberEstimateInput) => {
    updateNumberEstimate({ path: `/number-estimates/${id}`, body: input });
  };

  const handleDeleteNumberEstimate = (numberEstimateToDelete: NumberEstimate) => {
    deleteNumberEstimate({ path: `/number-estimates/${numberEstimateToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("numberPrecisions")}
        enableCreate={user?.permissions.numberEstimate.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />

      <ContentContainerLayout>
        <EstimationNombreTable
          onClickUpdateNumberEstimate={handleUpdateClick}
          onClickDeleteNumberEstimate={setNumberEstimateToDelete}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertNumberEstimateDialog != null}
        onClose={() => setUpsertNumberEstimateDialog(null)}
        title={
          upsertNumberEstimateDialog?.mode === "create"
            ? t("numberPrecisionCreationTitle")
            : upsertNumberEstimateDialog?.mode === "update"
              ? t("numberPrecisionEditionTitle")
              : undefined
        }
      >
        {upsertNumberEstimateDialog?.mode === "create" && (
          <EstimationNombreCreate
            onCancel={() => setUpsertNumberEstimateDialog(null)}
            onSubmit={handleCreateNumberEstimate}
          />
        )}
        {upsertNumberEstimateDialog?.mode === "update" && (
          <EstimationNombreUpdate
            numberEstimate={upsertNumberEstimateDialog.numberEstimate}
            onCancel={() => setUpsertNumberEstimateDialog(null)}
            onSubmit={handleUpdateNumberEstimate}
          />
        )}
      </EntityUpsertDialog>
      <EstimationNombreDeleteDialog
        numberEstimateToDelete={numberEstimateToDelete}
        onCancelDeletion={() => setNumberEstimateToDelete(null)}
        onConfirmDeletion={handleDeleteNumberEstimate}
      />
    </>
  );
};

export default EstimationNombrePage;
