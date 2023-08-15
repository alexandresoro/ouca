import { type ObserverExtended } from "@ou-ca/common/entities/observer";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type ObservateurDeleteProps = {
  observerToDelete: ObserverExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (observer: ObserverExtended) => void;
};

const ObservateurDelete: FunctionComponent<ObservateurDeleteProps> = ({
  observerToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (observerToDelete: ObserverExtended | null) => {
    if (observerToDelete != null) {
      onConfirmDeletion?.(observerToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={observerToDelete != null}
      messageContent={t("deleteObserverDialogMsg", {
        name: observerToDelete?.libelle,
      })}
      impactedItemsMessage={t("deleteObserverDialogMsgImpactedData", {
        nbOfObservations: observerToDelete?.entriesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(observerToDelete)}
    />
  );
};

export default ObservateurDelete;
