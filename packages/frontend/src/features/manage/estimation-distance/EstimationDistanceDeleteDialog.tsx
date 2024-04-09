import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../../../components/common/DeletionConfirmationDialog";

type EstimationDistanceDeleteDialogProps = {
  distanceEstimateToDelete: DistanceEstimate | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (distanceestimate: DistanceEstimate) => void;
};

const EstimationDistanceDeleteDialog: FunctionComponent<EstimationDistanceDeleteDialogProps> = ({
  distanceEstimateToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (distanceEstimateToDelete: DistanceEstimate | null) => {
    if (distanceEstimateToDelete != null) {
      onConfirmDeletion?.(distanceEstimateToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={distanceEstimateToDelete != null}
      messageContent={t("deleteDistancePrecisionDialogMsg", {
        name: distanceEstimateToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(distanceEstimateToDelete)}
    />
  );
};

export default EstimationDistanceDeleteDialog;
