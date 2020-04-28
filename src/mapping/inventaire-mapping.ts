import { Coordinates } from "ouca-common/coordinates.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { InventaireDb } from "../objects/db/inventaire-db.object";

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
