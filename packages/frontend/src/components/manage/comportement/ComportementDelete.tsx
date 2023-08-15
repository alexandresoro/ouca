import { type BehaviorExtended } from "@ou-ca/common/entities/behavior";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type ComportementDeleteProps = {
  behaviorToDelete: BehaviorExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (behavior: BehaviorExtended) => void;
};

const ComportementDelete: FunctionComponent<ComportementDeleteProps> = ({
  behaviorToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (behaviorToDelete: BehaviorExtended | null) => {
    if (behaviorToDelete != null) {
      onConfirmDeletion?.(behaviorToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={behaviorToDelete != null}
      messageContent={t("deleteBehaviorDialogMsg", {
        name: behaviorToDelete?.libelle,
      })}
      impactedItemsMessage={t("deleteBehaviorDialogMsgImpactedData")}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(behaviorToDelete)}
    />
  );
};

export default ComportementDelete;
