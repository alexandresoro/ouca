import { type TownExtended } from "@ou-ca/common/entities/town";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type CommuneDeleteProps = {
  townToDelete: TownExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (town: TownExtended) => void;
};

const CommuneDelete: FunctionComponent<CommuneDeleteProps> = ({
  townToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (townToDelete: TownExtended | null) => {
    if (townToDelete != null) {
      onConfirmDeletion?.(townToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={townToDelete != null}
      messageContent={t("deleteCityDialogMsg", {
        name: townToDelete?.nom,
        department: townToDelete?.departmentCode,
      })}
      impactedItemsMessage={t("deleteCityDialogMsgImpactedData", {
        nbOfObservations: townToDelete?.entriesCount ?? 0,
        nbOfLocalities: townToDelete?.localitiesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(townToDelete)}
    />
  );
};

export default CommuneDelete;
