import { Coordinates, Inventaire } from "@ou-ca/ouca-model";
import { format } from "date-fns";
import _ from "lodash";
import { InventaireDb } from "../objects/db/inventaire-db.object";
import { DATE_PATTERN, DATE_WITH_TIME_PATTERN } from "../utils/constants";
import { interpretDateTimestampAsLocalTimeZoneDate } from "../utils/date";

export const buildInventaireFromInventaireDb = (
  inventaireDb: InventaireDb,
  associesIds: number[],
  meteosIds: number[]
): Inventaire => {
  const coordinates: Coordinates = inventaireDb?.longitude
    ? {
      longitude: inventaireDb.longitude,
      latitude: inventaireDb.latitude,
      system: inventaireDb.coordinates_system
    }
    : null;

  return {
    id: inventaireDb.id,
    observateurId: inventaireDb.observateur_id,
    associesIds,
    date: inventaireDb.date,
    heure: inventaireDb.heure,
    duree: inventaireDb.duree,
    lieuditId: inventaireDb.lieudit_id,
    customizedAltitude: inventaireDb.altitude,
    coordinates,
    temperature: inventaireDb.temperature,
    meteosIds
  };
};

export const buildInventaireDbFromInventaire = (
  inventaire: Inventaire,
  coordinates: Coordinates | null
): InventaireDb => {
  const inventaireDb: InventaireDb = {
    id: inventaire.id,
    observateur_id: inventaire.observateurId,
    date: format(
      interpretDateTimestampAsLocalTimeZoneDate(inventaire.date),
      DATE_PATTERN
    ),
    heure: inventaire.heure,
    duree: inventaire.duree,
    lieudit_id: inventaire.lieuditId,
    temperature: inventaire.temperature,
    date_creation: format(new Date(), DATE_WITH_TIME_PATTERN)
  };

  if (_.has(inventaire, "customizedAltitude")) {
    // Get the customized coordinates if any
    // By default we consider that coordinates are not customized
    let altitude: number = null;
    let longitude: number = null;
    let latitude: number = null;
    let coordinatesSystem = null;

    // Then we check if coordinates were customized
    if (inventaire.coordinates) {
      altitude = inventaire.customizedAltitude;
      longitude = coordinates.longitude;
      latitude = coordinates.latitude;
      coordinatesSystem = coordinates.system;
    }

    inventaireDb.altitude = altitude;
    inventaireDb.longitude = longitude;
    inventaireDb.latitude = latitude;
    inventaireDb.coordinates_system = coordinatesSystem;
  }

  return inventaireDb;
};
