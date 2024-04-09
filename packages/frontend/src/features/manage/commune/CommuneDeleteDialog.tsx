import type { TownExtended } from "@ou-ca/common/api/entities/town";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../../../components/common/DeletionConfirmationDialog";

type CommuneDeleteDialogProps = {
  townToDelete: TownExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (town: TownExtended) => void;
};

const CommuneDeleteDialog: FunctionComponent<CommuneDeleteDialogProps> = ({
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
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(townToDelete)}
    />
  );
};

export default CommuneDeleteDialog;
