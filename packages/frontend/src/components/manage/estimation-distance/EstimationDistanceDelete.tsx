import { type DistanceEstimateExtended } from "@ou-ca/common/entities/distance-estimate";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type EstimationDistanceDeleteProps = {
  distanceEstimateToDelete: DistanceEstimateExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (distanceestimate: DistanceEstimateExtended) => void;
};

const EstimationDistanceDelete: FunctionComponent<EstimationDistanceDeleteProps> = ({
  distanceEstimateToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (distanceEstimateToDelete: DistanceEstimateExtended | null) => {
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
      impactedItemsMessage={t("deleteDistancePrecisionDialogMsgImpactedData", {
        nbOfObservations: distanceEstimateToDelete?.entriesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(distanceEstimateToDelete)}
    />
  );
};

export default EstimationDistanceDelete;
