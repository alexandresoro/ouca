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

  const [distanceEstimateToDelete, setDistanceEstimateToDelete] = useState<DistanceEstimateExtended | null>(null);

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

  const handleDeleteDistanceEstimate = (distanceEstimateToDelete: DistanceEstimateExtended) => {};

  return (
    <>
      <ManageTopBar title={t("distancePrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EstimationDistanceTable onClickUpdateDistanceEstimate={handleUpdateClick} />
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
