import { useUser } from "@hooks/useUser";
import { type UpsertDistanceEstimateInput, upsertDistanceEstimateResponse } from "@ou-ca/common/api/distance-estimate";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
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

  const { displayNotification } = useSnackbar();

  const [upsertDistanceEstimateDialog, setUpsertDistanceEstimateDialog] = useState<
    null | { mode: "create" } | { mode: "update"; distanceEstimate: DistanceEstimate }
  >(null);
  const [distanceEstimateToDelete, setDistanceEstimateToDelete] = useState<DistanceEstimate | null>(null);

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

  const { mutate: generateExport } = useApiExportEntities({ filename: t("distancePrecisions") });

  const handleCreateClick = () => {
    setUpsertDistanceEstimateDialog({ mode: "create" });
  };

  const handleUpdateClick = (distanceEstimate: DistanceEstimate) => {
    setUpsertDistanceEstimateDialog({ mode: "update", distanceEstimate });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/distance-estimates" });
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
