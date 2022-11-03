import { CalendarToday, LightMode, People, Place } from "@mui/icons-material";
import { Divider, List, Typography, useTheme } from "@mui/material";
import { intlFormat, parseISO } from "date-fns";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Inventaire } from "../../graphql/generated/graphql-types";
import { getInventaireCoordinates } from "../../model/coordinates-system/coordinates-helper";
import ItemWithAvatar from "../common/ItemWithAvatar";

type InventaireDetailsViewProps = {
  inventaire: Inventaire;
};

const InventaireDetailsView: FunctionComponent<InventaireDetailsViewProps> = (props) => {
  const { inventaire } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <List sx={{ borderRadius: "4px", border: 1, borderColor: theme.palette.grey[300] }}>
        <ItemWithAvatar
          primary={
            <Typography component="h3" variant="h6">
              {t("observationDetails.inventoryTitle")}
            </Typography>
          }
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<People />}
          primary={t("observationDetails.observer", {
            name: inventaire.observateur.libelle
          })}
          secondary={t("observationDetails.secondaryObservers", {
            count: inventaire.associes.length,
            names: inventaire.associes.map((i) => {
              return i?.libelle;
            })
          })}
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<CalendarToday />}
          primary={t("observationDetails.dateTime", {
            date: intlFormat(parseISO(inventaire.date)),
            time: inventaire.heure
          })}
          secondary={t("observationDetails.duration", {
            context: inventaire.duree ? "" : "undefined",
            duration: inventaire.duree
          })}
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<Place />}
          primary={t("observationDetails.locality", {
            locality: inventaire.lieuDit
          })}
          secondary={
            <>
              <span>
                {t("observationDetails.coordinates", {
                  coordinates: getInventaireCoordinates(inventaire)
                })}
              </span>
              <span>
                {t("observationDetails.altitude", {
                  altitude: getInventaireCoordinates(inventaire).altitude
                })}
              </span>
            </>
          }
        ></ItemWithAvatar>
        <Divider />

        <ItemWithAvatar
          icon={<LightMode />}
          primary={t("observationDetails.weathers", {
            count: inventaire.meteos.length,
            weathers: inventaire.meteos.map((m) => {
              return m?.libelle;
            })
          })}
          secondary={t("observationDetails.temperature", {
            context: inventaire.temperature ? "" : "undefined",
            temperature: inventaire.temperature
          })}
        ></ItemWithAvatar>
      </List>
    </>
  );
};

export default InventaireDetailsView;
