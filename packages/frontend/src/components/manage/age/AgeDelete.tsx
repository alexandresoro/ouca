import { type AgeExtended } from "@ou-ca/common/entities/age";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type AgeDeleteProps = {
  ageToDelete: AgeExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (age: AgeExtended) => void;
};

const AgeDelete: FunctionComponent<AgeDeleteProps> = ({ ageToDelete, onCancelDeletion, onConfirmDeletion }) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (ageToDelete: AgeExtended | null) => {
    if (ageToDelete != null) {
      onConfirmDeletion?.(ageToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={ageToDelete != null}
      messageContent={t("deleteAgeDialogMsg", {
        name: ageToDelete?.libelle,
      })}
      impactedItemsMessage={t("deleteAgeDialogMsgImpactedData", {
        nbOfObservations: ageToDelete?.entriesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(ageToDelete)}
    />
  );
};

export default AgeDelete;
