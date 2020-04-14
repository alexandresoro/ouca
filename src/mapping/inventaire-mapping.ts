import { Inventaire } from "ouca-common/inventaire.object";
import { InventaireDb } from "../objects/db/inventaire-db.object";

export const buildInventaireFromInventaireDb = (
  inventaireDb: InventaireDb
): Inventaire => {
  let coordinates = null;

  if (inventaireDb.coordinates_system) {
    coordinates = [];
    coordinates[inventaireDb.coordinates_system] = {
      longitude: inventaireDb.longitude,
      latitude: inventaireDb.latitude,
      system: inventaireDb.coordinates_system,
      isTransformed: false
    };
  }

  return {
    id: inventaireDb.id,
    observateurId: inventaireDb.observateur_id,
    associesIds: [],
    date: inventaireDb.date,
    heure: inventaireDb.heure,
    duree: inventaireDb.duree,
    lieuditId: inventaireDb.lieudit_id,
    customizedAltitude: inventaireDb.altitude,
    coordinates,
    temperature: inventaireDb.temperature,
    meteosIds: []
  };
};
