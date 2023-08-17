import { upsertDistanceEstimateResponse } from "@ou-ca/common/api/distance-estimate";
import { type DistanceEstimateExtended } from "@ou-ca/common/entities/distance-estimate";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EstimationDistanceDeleteDialog from "./EstimationDistanceDeleteDialog";
import EstimationDistanceTable from "./EstimationDistanceTable";

const EstimationDistancePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertDistanceEstimateDialog, setUpsertDistanceEstimateDialog] = useState<null | { mode: "create" } | { mode: "update"; id: string }>(
    null
  );
  const [distanceEstimateToDelete, setDistanceEstimateToDelete] = useState<DistanceEstimateExtended | null>(null);

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
    }
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
    }
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
        setDistanceEstimateToDelete(null)
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("distancePrecisions") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/distance-estimates" });
  };

  const handleDeleteDistanceEstimate = (distanceEstimateToDelete: DistanceEstimateExtended) => {
    deleteDistanceEstimate({ path: `/distance-estimates/${distanceEstimateToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("distancePrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EstimationDistanceTable onClickUpdateDistanceEstimate={handleUpdateClick} onClickDeleteDistanceEstimate={setDistanceEstimateToDelete} />
      </ContentContainerLayout>
      <EstimationDistanceDeleteDialog
        distanceEstimateToDelete={distanceEstimateToDelete}
        onCancelDeletion={() => setDistanceEstimateToDelete(null)}
        onConfirmDeletion={handleDeleteDistanceEstimate}
      />
    </>
  );
};

export default EstimationDistancePage;
