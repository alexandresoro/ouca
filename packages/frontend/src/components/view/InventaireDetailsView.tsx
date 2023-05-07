import { Calendar, Map as MapIcon, Sun, User } from "@styled-icons/boxicons-regular";
import { intlFormat, parseISO } from "date-fns";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { type Inventaire } from "../../gql/graphql";
import { getInventaireCoordinates } from "../../utils/coordinates-helper";
import ItemWithAvatar from "../common/ItemWithAvatar";

type InventaireDetailsViewProps = {
  inventaire: Inventaire;
};

const InventaireDetailsView: FunctionComponent<InventaireDetailsViewProps> = (props) => {
  const { inventaire } = props;

  const { t } = useTranslation();

  return (
    <>
      <ul className="border border-solid rounded border-neutral-300 divide-solid divide-neutral-200 divide-y py-2">
        <ItemWithAvatar primary={<h3 className="text-lg font-normal">{t("observationDetails.inventoryTitle")}</h3>} />

        <ItemWithAvatar
          icon={<User className="h-6" />}
          primary={t("observationDetails.observer", {
            name: inventaire.observateur.libelle,
          })}
          secondary={t("observationDetails.secondaryObservers", {
            count: inventaire.associes.length,
            names: inventaire.associes.map((i) => {
              return i?.libelle;
            }),
          })}
        />

        <ItemWithAvatar
          icon={<Calendar className="h-6" />}
          primary={t("observationDetails.dateTime", {
            date: intlFormat(parseISO(inventaire.date)),
            time: inventaire.heure,
          })}
          secondary={t("observationDetails.duration", {
            context: inventaire.duree ? "" : "undefined",
            duration: inventaire.duree,
          })}
        />

        <ItemWithAvatar
          icon={<MapIcon className="h-6" />}
          primary={t("observationDetails.locality", {
            locality: inventaire.lieuDit,
          })}
          secondary={
            <>
              <span>
                {t("observationDetails.coordinates", {
                  coordinates: getInventaireCoordinates(inventaire),
                })}
              </span>
              <span>
                {t("observationDetails.altitude", {
                  altitude: getInventaireCoordinates(inventaire).altitude,
                })}
              </span>
            </>
          }
        />

        <ItemWithAvatar
          icon={<Sun className="h-6" />}
          primary={t("observationDetails.weathers", {
            count: inventaire.meteos.length,
            weathers: inventaire.meteos.map((m) => {
              return m?.libelle;
            }),
          })}
          secondary={t("observationDetails.temperature", {
            context: inventaire.temperature ? "" : "undefined",
            temperature: inventaire.temperature,
          })}
        />
      </ul>
    </>
  );
};

export default InventaireDetailsView;
