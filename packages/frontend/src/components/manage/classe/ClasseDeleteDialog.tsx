import { type SpeciesClassExtended } from "@ou-ca/common/entities/species-class";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type ClasseDeleteDialogProps = {
  speciesClassToDelete: SpeciesClassExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (speciesClass: SpeciesClassExtended) => void;
};

const ClasseDeleteDialog: FunctionComponent<ClasseDeleteDialogProps> = ({
  speciesClassToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (speciesClassToDelete: SpeciesClassExtended | null) => {
    if (speciesClassToDelete != null) {
      onConfirmDeletion?.(speciesClassToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={speciesClassToDelete != null}
      messageContent={t("deleteClassDialogMsg", {
        name: speciesClassToDelete?.libelle,
      })}
      impactedItemsMessage={t("deleteClassDialogMsgImpactedData", {
        nbOfObservations: speciesClassToDelete?.entriesCount ?? 0,
        nbOfSpecies: speciesClassToDelete?.speciesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(speciesClassToDelete)}
    />
  );
};

export default ClasseDeleteDialog;
