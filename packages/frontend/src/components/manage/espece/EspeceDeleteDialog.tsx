import { type SpeciesExtended } from "@ou-ca/common/entities/species";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type EspeceDeleteDialogProps = {
  speciesToDelete: SpeciesExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (species: SpeciesExtended) => void;
};

const EspeceDeleteDialog: FunctionComponent<EspeceDeleteDialogProps> = ({
  speciesToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (speciesToDelete: SpeciesExtended | null) => {
    if (speciesToDelete != null) {
      onConfirmDeletion?.(speciesToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={speciesToDelete != null}
      messageContent={t("deleteSpeciesDialogMsg", {
        name: speciesToDelete?.nomFrancais,
        code: speciesToDelete?.code,
      })}
      impactedItemsMessage={t("deleteSpeciesDialogMsgImpactedData", {
        nbOfObservations: speciesToDelete?.entriesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(speciesToDelete)}
    />
  );
};

export default EspeceDeleteDialog;
