import { DonneeCompleteWithIds, DonneeDbWithJoins } from "../objects/db/donnee-db.type";
import { query } from "./sql-queries-utils";

export const queryToGetAllDonneesWithIds = async (): Promise<DonneeCompleteWithIds[]> => {
  const donneesWithJoins = await query<DonneeDbWithJoins[]>("SELECT d.id,d.inventaire_id,d.espece_id,d.sexe_id,d.age_id,d.estimation_nombre_id,d.nombre,d.estimation_distance_id,d.distance,d.commentaire,d.regroupement,d.date_creation" +
    ',GROUP_CONCAT(Distinct comportement_id SEPARATOR ",") as comportements_ids,GROUP_CONCAT(Distinct milieu_id SEPARATOR ",") as milieux_ids' +
    " FROM donnee d" +
    " LEFT JOIN donnee_comportement c on d.id = c.donnee_id" +
    " LEFT JOIN donnee_milieu m on d.id = m.donnee_id" +
    " GROUP BY d.id"
  );

  const donneesProper = donneesWithJoins.map((donnee) => {
    const { comportements_ids, milieux_ids, ...otherFieldsDonnee } = donnee;
    return {
      comportements_ids: new Set(comportements_ids?.split(",").map(comportementId => +comportementId) ?? []),
      milieux_ids: new Set(milieux_ids?.split(",").map(milieuId => +milieuId) ?? []),
      ...otherFieldsDonnee
    }
  });


  return donneesProper;
};
