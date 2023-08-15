import { type WeatherExtended } from "@ou-ca/common/entities/weather";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";

type MeteoDeleteProps = {
  weatherToDelete: WeatherExtended | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (weather: WeatherExtended) => void;
};

const MeteoDelete: FunctionComponent<MeteoDeleteProps> = ({ weatherToDelete, onCancelDeletion, onConfirmDeletion }) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (weatherToDelete: WeatherExtended | null) => {
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
      impactedItemsMessage={t("deleteWeatherDialogMsgImpactedData")}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(weatherToDelete)}
    />
  );
};

export default MeteoDelete;
