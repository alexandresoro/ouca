import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import { Calendar, Map as MapIcon, Sun, User } from "@styled-icons/boxicons-regular";
import { intlFormat, parseISO } from "date-fns";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { getInventaireCoordinates } from "../../../utils/coordinates-helper";
import ItemWithAvatar from "../../common/ItemWithAvatar";

type InventorySummaryPanelProps = {
  inventory: InventoryExtended;
};

const InventorySummaryPanel: FunctionComponent<InventorySummaryPanelProps> = ({ inventory }) => {
  const { t } = useTranslation();

  return (
    <div className="card border-2 border-primary bg-base-200 shadow-xl py-4">
      <ItemWithAvatar
        icon={<User className="h-6" />}
        primary={inventory.observer.libelle}
        secondary={
          inventory.associates.length ? (
            <div className="first-letter:uppercase">
              {`${t("associateObservers", { count: inventory.associates.length })}: ${inventory.associates
                .map(({ libelle }) => libelle)
                .join(", ")}`}
            </div>
          ) : undefined
        }
      />

      <ItemWithAvatar
        icon={<Calendar className="h-6" />}
        primary={`${intlFormat(parseISO(inventory.date))} ${inventory.heure ?? ""}`}
        secondary={inventory.duree ? `${t("duration")}: ${inventory.duree}` : undefined}
      />

      <ItemWithAvatar
        icon={<MapIcon className="h-6" />}
        primary={
          <>
            <div>{inventory.locality.nom}</div>
            <div>{`${inventory.locality.townName} (${inventory.locality.departmentCode})`}</div>
          </>
        }
        secondary={`${t("latitude_abbr")}: ${getInventaireCoordinates(inventory).latitude}°, ${t("longitude_abbr")}: ${
          getInventaireCoordinates(inventory).longitude
        }° - ${t("altitude_abbr")}: ${getInventaireCoordinates(inventory).altitude} m`}
      />

      <ItemWithAvatar
        icon={<Sun className="h-6" />}
        primary={
          <div className="first-letter:uppercase">
            {inventory.weathers.length
              ? `${t("weathers", { count: inventory.weathers.length })}: ${inventory.weathers
                  .map(({ libelle }) => libelle)
                  .join(", ")}`
              : t("unspecified")}
          </div>
        }
        secondary={t("observationDetails.temperature", {
          context: inventory.temperature ? "" : "undefined",
          temperature: inventory.temperature,
        })}
      />
    </div>
  );
};

export default InventorySummaryPanel;
