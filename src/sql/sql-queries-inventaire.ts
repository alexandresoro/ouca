import { InventaireCompleteWithIds, InventaireDbWithJoins } from "../objects/db/inventaire-db.object";
import { query } from "./sql-queries-utils";

export const queryToGetAllInventairesWithIds = async (): Promise<InventaireCompleteWithIds[]> => {
  const inventairesWithJoins = await query<InventaireDbWithJoins[]>("SELECT i.id,i.observateur_id,i.date,i.heure,i.duree,i.lieudit_id,i.altitude,i.longitude,i.latitude,i.coordinates_system,i.temperature,i.date_creation" +
    ',GROUP_CONCAT(Distinct meteo_id SEPARATOR ",") as meteos_ids,GROUP_CONCAT(Distinct a.observateur_id SEPARATOR ",") as associes_ids' +
    " FROM inventaire i" +
    " LEFT JOIN inventaire_meteo m on i.id = m.inventaire_id" +
    " LEFT JOIN inventaire_associe a on i.id = a.inventaire_id" +
    " GROUP BY i.id"
  );

  const inventairesProper = inventairesWithJoins.map((inventaire) => {
    const { meteos_ids, associes_ids, ...otherFieldsInventaire } = inventaire;
    return {
      meteos_ids: new Set(meteos_ids?.split(",").map(meteoId => +meteoId) ?? []),
      associes_ids: new Set(associes_ids?.split(",").map(associeId => +associeId) ?? []),
      ...otherFieldsInventaire
    }
  });


  return inventairesProper;
};
