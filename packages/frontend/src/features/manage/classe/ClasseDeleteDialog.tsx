import type { SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../../../components/common/DeletionConfirmationDialog";

type ClasseDeleteDialogProps = {
  speciesClassToDelete: SpeciesClass | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (speciesClass: SpeciesClass) => void;
};

const ClasseDeleteDialog: FunctionComponent<ClasseDeleteDialogProps> = ({
  speciesClassToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (speciesClassToDelete: SpeciesClass | null) => {
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
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(speciesClassToDelete)}
    />
  );
};

export default ClasseDeleteDialog;
