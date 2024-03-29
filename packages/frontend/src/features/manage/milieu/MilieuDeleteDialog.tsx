import type { EnvironmentExtended } from "@ou-ca/common/api/entities/environment";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../../../components/common/DeletionConfirmationDialog";

type MilieuDeleteDialogProps = {
  environmentToDelete: EnvironmentExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (environment: EnvironmentExtended) => void;
};

const MilieuDeleteDialog: FunctionComponent<MilieuDeleteDialogProps> = ({
  environmentToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (environmentToDelete: EnvironmentExtended | null) => {
    if (environmentToDelete != null) {
      onConfirmDeletion?.(environmentToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={environmentToDelete != null}
      messageContent={t("deleteEnvironmentDialogMsg", {
        name: environmentToDelete?.libelle,
      })}
      impactedItemsMessage={t("deleteEnvironmentDialogMsgImpactedData")}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(environmentToDelete)}
    />
  );
};

export default MilieuDeleteDialog;
