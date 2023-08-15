import { type NumberEstimateExtended } from "@ou-ca/common/entities/number-estimate";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type EstimationNombreDeleteDialogProps = {
  numberEstimateToDelete: NumberEstimateExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (numberestimate: NumberEstimateExtended) => void;
};

const EstimationNombreDeleteDialog: FunctionComponent<EstimationNombreDeleteDialogProps> = ({
  numberEstimateToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (numberEstimateToDelete: NumberEstimateExtended | null) => {
    if (numberEstimateToDelete != null) {
      onConfirmDeletion?.(numberEstimateToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={numberEstimateToDelete != null}
      messageContent={t("deleteNumberPrecisionDialogMsg", {
        name: numberEstimateToDelete?.libelle,
      })}
      impactedItemsMessage={t("deleteNumberPrecisionDialogMsgImpactedData", {
        nbOfObservations: numberEstimateToDelete?.entriesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(numberEstimateToDelete)}
    />
  );
};

export default EstimationNombreDeleteDialog;
