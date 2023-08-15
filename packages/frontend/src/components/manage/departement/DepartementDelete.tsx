import { type DepartmentExtended } from "@ou-ca/common/entities/department";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type DepartementDeleteProps = {
  departmentToDelete: DepartmentExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (department: DepartmentExtended) => void;
};

const DepartementDelete: FunctionComponent<DepartementDeleteProps> = ({
  departmentToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (departmentToDelete: DepartmentExtended | null) => {
    if (departmentToDelete != null) {
      onConfirmDeletion?.(departmentToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={departmentToDelete != null}
      messageContent={t("deleteDepartmentDialogMsg", {
        code: departmentToDelete?.code,
      })}
      impactedItemsMessage={t("deleteDepartmentDialogMsgImpactedData", {
        nbOfObservations: departmentToDelete?.entriesCount ?? 0,
        nbOfCities: departmentToDelete?.townsCount ?? 0,
        nbOfLocalities: departmentToDelete?.localitiesCount ?? 0,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(departmentToDelete)}
    />
  );
};

export default DepartementDelete;
