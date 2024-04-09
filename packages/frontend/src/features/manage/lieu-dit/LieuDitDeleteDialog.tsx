import type { LocalityExtended } from "@ou-ca/common/api/entities/locality";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../../../components/common/DeletionConfirmationDialog";

type LieuDitDeleteDialogProps = {
  localityToDelete: LocalityExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (locality: LocalityExtended) => void;
};

const LieuDitDeleteDialog: FunctionComponent<LieuDitDeleteDialogProps> = ({
  localityToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (localityToDelete: LocalityExtended | null) => {
    if (localityToDelete != null) {
      onConfirmDeletion?.(localityToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={localityToDelete != null}
      messageContent={t("deleteLieuDitDialogMsg", {
        name: localityToDelete?.nom,
        city: localityToDelete?.townName,
        department: localityToDelete?.departmentCode,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(localityToDelete)}
    />
  );
};

export default LieuDitDeleteDialog;
