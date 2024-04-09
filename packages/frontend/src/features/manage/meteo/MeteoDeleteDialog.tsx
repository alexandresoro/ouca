import type { Weather } from "@ou-ca/common/api/entities/weather";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../../../components/common/DeletionConfirmationDialog";

type MeteoDeleteDialogProps = {
  weatherToDelete: Weather | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (weather: Weather) => void;
};

const MeteoDeleteDialog: FunctionComponent<MeteoDeleteDialogProps> = ({
  weatherToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (weatherToDelete: Weather | null) => {
    if (weatherToDelete != null) {
      onConfirmDeletion?.(weatherToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={weatherToDelete != null}
      messageContent={t("deleteWeatherDialogMsg", {
        name: weatherToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(weatherToDelete)}
    />
  );
};

export default MeteoDeleteDialog;
