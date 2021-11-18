import { Donnee } from "../model/types/donnee.object";
import { DonneeCompleteWithIds, DonneeDbWithJoins } from "../objects/db/donnee-db.type";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { prepareStringForSqlQuery, query } from "./sql-queries-utils";

export const queryToCreateDonneeTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS donnee (" +
    " id MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " inventaire_id MEDIUMINT(8) UNSIGNED NOT NULL," +
    " espece_id MEDIUMINT(8) UNSIGNED NOT NULL," +
    " sexe_id SMALLINT(5) UNSIGNED NOT NULL," +
    " age_id SMALLINT(5) UNSIGNED NOT NULL," +
    " estimation_nombre_id SMALLINT(5) UNSIGNED NOT NULL," +
    " nombre SMALLINT(5) UNSIGNED DEFAULT NULL," +
    " estimation_distance_id SMALLINT(5) UNSIGNED DEFAULT NULL," +
    " distance SMALLINT(5) UNSIGNED DEFAULT NULL," +
    " commentaire TEXT," +
    " regroupement SMALLINT(5) UNSIGNED DEFAULT NULL," +
    " date_creation DATETIME NOT NULL," +
    " PRIMARY KEY (id)," +
    " CONSTRAINT `fk_donnee_inventaire_id` FOREIGN KEY (inventaire_id) REFERENCES inventaire (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_donnee_espece_id` FOREIGN KEY (espece_id) REFERENCES espece (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_donnee_sexe_id` FOREIGN KEY (sexe_id) REFERENCES sexe (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_donnee_age_id` FOREIGN KEY (age_id) REFERENCES age (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_donnee_estimation_nombre_id` FOREIGN KEY (estimation_nombre_id) REFERENCES estimation_nombre (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_donnee_estimation_distance_id` FOREIGN KEY (estimation_distance_id) REFERENCES estimation_distance (id) ON DELETE SET NULL" +
    " )");
}

export const queryToCreateDonneeComportementTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS donnee_comportement (" +
    " donnee_id MEDIUMINT(8) UNSIGNED NOT NULL, " +
    " comportement_id SMALLINT(5) UNSIGNED NOT NULL," +
    " PRIMARY KEY (donnee_id,comportement_id)," +
    " CONSTRAINT `fk_donnee_comportement_donnee_id` FOREIGN KEY (donnee_id) REFERENCES donnee (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_donnee_comportement_comportement_id` FOREIGN KEY (comportement_id) REFERENCES comportement (id) ON DELETE CASCADE" +
    " )");
}

export const queryToCreateDonneeMilieuTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS donnee_milieu (" +
    " donnee_id MEDIUMINT(8) UNSIGNED NOT NULL," +
    " milieu_id SMALLINT(5) UNSIGNED NOT NULL," +
    " PRIMARY KEY (donnee_id,milieu_id)," +
    " CONSTRAINT `fk_donnee_milieu_donnee_id` FOREIGN KEY (donnee_id) REFERENCES donnee (id) ON DELETE CASCADE," +
    " CONSTRAINT `fk_donnee_milieu_milieu_id` FOREIGN KEY (milieu_id) REFERENCES milieu (id) ON DELETE CASCADE" +
    " )");
}

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

export const queryToCountDonneesByInventaireId = async (
  inventaireId: number
): Promise<{ nbDonnees: number }[]> => {
  return query<{ nbDonnees: number }[]>(
    `SELECT COUNT(*) as nbDonnees FROM donnee WHERE inventaire_id=${inventaireId}`
  );
};

export const queryToUpdateDonneesInventaireId = async (
  oldInventaireId: number,
  newInventaireId: number
): Promise<SqlSaveResponse> => {
  return query<SqlSaveResponse>(
    `UPDATE donnee SET inventaire_id=${newInventaireId} WHERE inventaire_id=${oldInventaireId}`
  );
};

export const queryToFindDonneeIdsByAllAttributes = async (
  donnee: Donnee
): Promise<{ id: number }[]> => {
  let queryStr: string =
    "SELECT d.id as id FROM donnee d" +
    ` WHERE d.inventaire_id=${donnee.inventaireId}` +
    ` AND d.espece_id=${donnee.especeId}` +
    ` AND d.sexe_id=${donnee.sexeId}` +
    ` AND d.age_id=${donnee.ageId}` +
    ` AND d.estimation_nombre_id=${donnee.estimationNombreId}`;

  queryStr =
    queryStr +
    " AND d.nombre" +
    (!donnee.nombre ? " is null" : `=${donnee.nombre}`);

  queryStr =
    queryStr +
    " AND d.estimation_distance_id" +
    (!donnee.estimationDistanceId
      ? " is null"
      : `=${donnee.estimationDistanceId}`);

  queryStr =
    queryStr +
    " AND d.distance" +
    ((donnee.distance == null) ? " is null" : `=${donnee.distance}`);

  queryStr =
    queryStr +
    " AND d.regroupement" +
    (!donnee.regroupement ? " is null" : `=${donnee.regroupement}`);

  queryStr =
    queryStr +
    " AND d.commentaire" +
    (!donnee.commentaire ? " is null" : `="${prepareStringForSqlQuery(donnee.commentaire)}"`);

  return query<{ id: number }[]>(queryStr);
};
