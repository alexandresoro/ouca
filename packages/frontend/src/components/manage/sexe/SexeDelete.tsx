import { type SexExtended } from "@ou-ca/common/entities/sex";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type SexeDeleteProps = {
  sexToDelete: SexExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (sex: SexExtended) => void;
};

const SexeDelete: FunctionComponent<SexeDeleteProps> = ({ sexToDelete, onCancelDeletion, onConfirmDeletion }) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (sexToDelete: SexExtended | null) => {
    if (sexToDelete != null) {
      onConfirmDeletion?.(sexToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={sexToDelete != null}
      messageContent={t("deleteGenderDialogMsg", {
        name: sexToDelete?.libelle,
      })}
      impactedItemsMessage={t("deleteGenderDialogMsgImpactedData", {
        nbOfObservations: sexToDelete?.entriesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(sexToDelete)}
    />
  );
};

export default SexeDelete;
