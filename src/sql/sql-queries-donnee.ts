import { format } from "date-fns";
import { Donnee } from "../model/types/donnee.object";
import { DonneesFilter } from "../model/types/donnees-filter.object";
import { FlatDonnee } from "../model/types/flat-donnee.object";
import { NicheurCode } from "../model/types/nicheur.model";
import { DonneeCompleteWithIds, DonneeDbWithJoins } from "../objects/db/donnee-db.type";
import { FlatDonneeWithMinimalData } from "../objects/flat-donnee-with-minimal-data.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { DATE_PATTERN, TABLE_COMPORTEMENT, TABLE_DONNEE_COMPORTEMENT, TABLE_DONNEE_MILIEU, TABLE_INVENTAIRE_ASSOCIE, TABLE_INVENTAIRE_METEO } from "../utils/constants";
import { interpretDateTimestampAsLocalTimeZoneDate } from "../utils/date";
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

const getBaseQueryToFindDonnees = (): string => {
  return (
    "SELECT " +
    "d.id," +
    "d.inventaire_id as inventaireId," +
    "i.observateur_id as observateurId," +
    "i.date," +
    "i.heure," +
    "i.duree," +
    "i.lieudit_id as lieuditId," +
    "i.altitude," +
    "i.longitude," +
    "i.latitude," +
    "i.coordinates_system as coordinatesSystem," +
    "i.temperature," +
    "d.espece_id as especeId," +
    "d.sexe_id as sexeId," +
    "d.age_id as ageId," +
    "d.estimation_nombre_id as estimationNombreId," +
    "d.nombre," +
    "d.estimation_distance_id as estimationDistanceId," +
    "d.distance," +
    "d.commentaire," +
    "d.regroupement" +
    " FROM donnee d, inventaire i" +
    " WHERE d.inventaire_id=i.id"
  );
};

const getBaseQueryToFindDetailedDonnees = (): string => {
  return (
    "SELECT t_donnee.id," +
    " t_inventaire.id as inventaireId," +
    " t_observateur.libelle as observateur," +
    " t_inventaire.date," +
    " t_inventaire.heure," +
    " t_inventaire.duree, " +
    " t_departement.code as departement," +
    " t_commune.code as codeCommune," +
    " t_commune.nom as nomCommune," +
    " t_lieudit.nom as lieudit," +
    " t_lieudit.altitude as altitude," +
    " t_lieudit.longitude as longitude," +
    " t_lieudit.latitude as latitude," +
    " t_lieudit.coordinates_system as coordinatesSystem," +
    " t_inventaire.altitude as customizedAltitude," +
    " t_inventaire.longitude as customizedLongitude," +
    " t_inventaire.latitude as customizedLatitude," +
    " t_inventaire.coordinates_system as customizedCoordinatesSystem," +
    " t_inventaire.temperature, " +
    " t_classe.libelle as classe," +
    " t_espece.code as codeEspece," +
    " t_espece.nom_francais as nomFrancais," +
    " t_espece.nom_latin as nomLatin, " +
    " t_sexe.libelle as sexe," +
    " t_age.libelle as age," +
    " t_estim_nb.libelle as estimationNombre," +
    " t_donnee.nombre," +
    " t_estim_dist.libelle as estimationDistance," +
    " t_donnee.distance," +
    " t_donnee.regroupement," +
    " t_donnee.commentaire" +
    " FROM donnee t_donnee" +
    " LEFT JOIN inventaire t_inventaire ON t_donnee.inventaire_id = t_inventaire.id" +
    " LEFT JOIN observateur t_observateur ON t_inventaire.observateur_id = t_observateur.id" +
    " LEFT JOIN lieudit t_lieudit ON t_inventaire.lieudit_id = t_lieudit.id" +
    " LEFT JOIN commune t_commune ON t_lieudit.commune_id = t_commune.id" +
    " LEFT JOIN departement t_departement ON t_commune.departement_id = t_departement.id" +
    " LEFT JOIN espece t_espece ON t_donnee.espece_id = t_espece.id" +
    " LEFT JOIN classe t_classe ON t_espece.classe_id = t_classe.id" +
    " LEFT JOIN sexe t_sexe ON t_donnee.sexe_id = t_sexe.id" +
    " LEFT JOIN age t_age ON t_donnee.age_id = t_age.id" +
    " LEFT JOIN estimation_nombre t_estim_nb ON t_donnee.estimation_nombre_id = t_estim_nb.id " +
    " LEFT JOIN estimation_distance t_estim_dist ON t_donnee.estimation_distance_id = t_estim_dist.id"
  );
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

export const queryToFindNextDonneeIdByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<{ id: number }[]> => {
  return query<{ id: number }[]>(
    "SELECT d.id" +
    " FROM donnee d" +
    " WHERE d.id>" +
    `${currentDonneeId}` +
    " ORDER BY id ASC LIMIT 0,1"
  );
};

export const queryToFindPreviousDonneeIdByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<{ id: number }[]> => {
  return query<{ id: number }[]>(
    "SELECT d.id" +
    " FROM donnee d" +
    " WHERE d.id<" +
    `${currentDonneeId}` +
    " ORDER BY d.id DESC LIMIT 0,1"
  );
};

export const queryToFindAllDonnees = async (): Promise<
  FlatDonneeWithMinimalData[]
> => {
  return query<FlatDonneeWithMinimalData[]>(getBaseQueryToFindDonnees());
};

export const queryToFindDonneeById = async (
  id: number
): Promise<FlatDonneeWithMinimalData[]> => {
  return query<FlatDonneeWithMinimalData[]>(
    getBaseQueryToFindDonnees() + ` AND d.id=${id}`
  );
};

export const queryToFindDonneeIndexById = async (
  id: number
): Promise<{ nbDonnees: number }[]> => {
  return query<{ nbDonnees: number }[]>(
    `SELECT count(*) as nbDonnees FROM donnee WHERE id<=${id}`
  );
};

export const queryToFindLastRegroupement = async (): Promise<
  { regroupement: number }[]
> => {
  return query<{ regroupement: number }[]>(
    "SELECT MAX(d.regroupement) as regroupement FROM donnee d"
  );
};

const getQueryToFindDonneesIdsByNicheursCodes = (
  nicheurCodes: NicheurCode[]
): string => {
  const codesStr = nicheurCodes.map((code) => {
    return '"' + code + '"';
  }).join(",");

  const queryStr =
    " SELECT distinct t_donnee_comportement.donnee_id" +
    " FROM " +
    TABLE_DONNEE_COMPORTEMENT +
    " t_donnee_comportement" +
    " JOIN " +
    TABLE_COMPORTEMENT +
    " t_comportement" +
    " ON t_comportement.id = t_donnee_comportement.comportement_id" +
    " WHERE t_comportement.nicheur IN (" +
    codesStr +
    ")";
  return queryStr;
};

const getQueryToFindDonneesIdsByComportementsIds = (
  comportementsIds: number[]
): string => {
  const queryStr =
    " SELECT distinct t_donnee_comportement.donnee_id" +
    " FROM " +
    TABLE_DONNEE_COMPORTEMENT +
    " t_donnee_comportement" +
    " WHERE t_donnee_comportement.comportement_id IN (" +
    comportementsIds.join(",") +
    ")";
  return queryStr;
};

const getQueryToFindDonneesIdsByMilieuxIds = (milieuxIds: number[]): string => {
  const queryStr =
    " SELECT distinct t_donnee_milieu.donnee_id" +
    " FROM " +
    TABLE_DONNEE_MILIEU +
    " t_donnee_milieu" +
    " WHERE t_donnee_milieu.milieu_id IN (" +
    milieuxIds.join(",") +
    ")";
  return queryStr;
};

export const queryToFindDonneesByCriterion = async (
  criterion?: DonneesFilter
): Promise<FlatDonnee[]> => {
  let queryStr: string = getBaseQueryToFindDetailedDonnees();

  const whereTab: string[] = [];

  if (criterion) {
    if (criterion.id) {
      whereTab.push(` t_donnee.id=${criterion.id}`);
    }

    if (
      criterion.especeGroup.classes &&
      criterion.especeGroup.classes.length > 0
    ) {
      whereTab.push(
        " t_classe.id IN (" + criterion.especeGroup.classes.join(",") + ")"
      );
    }

    if (
      criterion.especeGroup.especes &&
      criterion.especeGroup.especes.length > 0
    ) {
      whereTab.push(
        " t_espece.id IN (" + criterion.especeGroup.especes.join(",") + ")"
      );
    }

    if (
      criterion.lieuditGroup.departements &&
      criterion.lieuditGroup.departements.length > 0
    ) {
      whereTab.push(
        " t_departement.id IN (" +
        criterion.lieuditGroup.departements.join(",") +
        ")"
      );
    }

    if (
      criterion.lieuditGroup.communes &&
      criterion.lieuditGroup.communes.length > 0
    ) {
      whereTab.push(
        " t_commune.id IN (" + criterion.lieuditGroup.communes.join(",") + ")"
      );
    }

    if (
      criterion.lieuditGroup.lieuxdits &&
      criterion.lieuditGroup.lieuxdits.length > 0
    ) {
      whereTab.push(
        " t_lieudit.id IN (" + criterion.lieuditGroup.lieuxdits.join(",") + ")"
      );
    }

    if (criterion.sexes && criterion.sexes.length > 0) {
      whereTab.push(" t_sexe.id IN (" + criterion.sexes.join(",") + ")");
    }

    if (criterion.ages && criterion.ages.length > 0) {
      whereTab.push(" t_age.id IN (" + criterion.ages.join(",") + ")");
    }

    if (
      criterion.nombreGroup.estimationsNombre &&
      criterion.nombreGroup.estimationsNombre.length > 0
    ) {
      whereTab.push(
        " t_estim_nb.id IN (" +
        criterion.nombreGroup.estimationsNombre.join(",") +
        ")"
      );
    }

    if (
      criterion.distanceGroup.estimationsDistance &&
      criterion.distanceGroup.estimationsDistance.length > 0
    ) {
      whereTab.push(
        " t_estim_dist.id IN (" +
        criterion.distanceGroup.estimationsDistance.join(",") +
        ")"
      );
    }

    if (criterion.observateurs && criterion.observateurs.length > 0) {
      whereTab.push(
        " t_observateur.id IN (" + criterion.observateurs.join(",") + ")"
      );
    }

    if (criterion.fromDate) {
      whereTab.push(
        " t_inventaire.date>='" +
        format(
          interpretDateTimestampAsLocalTimeZoneDate(criterion.fromDate),
          DATE_PATTERN
        ) +
        "'"
      );
    }

    if (criterion.toDate) {
      whereTab.push(
        " t_inventaire.date<='" +
        format(
          interpretDateTimestampAsLocalTimeZoneDate(criterion.toDate),
          DATE_PATTERN
        ) +
        "'"
      );
    }

    if (criterion.temperature && Number.isInteger(criterion.temperature)) {
      whereTab.push(` t_inventaire.temperature=${criterion.temperature}`);
    }

    if (
      criterion.nombreGroup.nombre &&
      Number.isInteger(criterion.nombreGroup.nombre)
    ) {
      whereTab.push(` t_donnee.nombre=${criterion.nombreGroup.nombre}`);
    }

    if (
      criterion.distanceGroup.distance &&
      Number.isInteger(criterion.distanceGroup.distance)
    ) {
      whereTab.push(` t_donnee.distance=${criterion.distanceGroup.distance}`);
    }

    if (criterion.regroupement && Number.isInteger(criterion.regroupement)) {
      whereTab.push(` t_donnee.regroupement=${criterion.regroupement}`);
    }

    if (criterion.heure) {
      whereTab.push(' t_inventaire.heure="' + criterion.heure + '"');
    }

    if (criterion.duree) {
      whereTab.push(' t_inventaire.duree="' + criterion.duree + '"');
    }

    if (criterion.commentaire) {
      whereTab.push(
        ' t_donnee.commentaire like "%' + criterion.commentaire + '%"'
      );
    }

    if (criterion.associes && criterion.associes.length > 0) {
      whereTab.push(
        " t_inventaire.id IN" +
        " (SELECT distinct t_inventaire_associe.inventaire_id" +
        " FROM " +
        TABLE_INVENTAIRE_ASSOCIE +
        " t_inventaire_associe" +
        " WHERE t_inventaire_associe.observateur_id IN (" +
        criterion.associes.join(",") +
        "))"
      );
    }

    if (criterion.meteos && criterion.meteos.length > 0) {
      whereTab.push(
        " t_inventaire.id IN" +
        " (SELECT distinct t_inventaire_meteo.inventaire_id" +
        " FROM " +
        TABLE_INVENTAIRE_METEO +
        " t_inventaire_meteo" +
        " WHERE t_inventaire_meteo.meteo_id IN (" +
        criterion.meteos.join(",") +
        "))"
      );
    }

    // Filter by Nicheurs
    if (criterion.nicheurs && criterion.nicheurs.length > 0) {
      whereTab.push(
        " t_donnee.id IN (" +
        getQueryToFindDonneesIdsByNicheursCodes(criterion.nicheurs) +
        ")"
      );
    }

    // Filter by Comportements
    if (criterion.comportements && criterion.comportements.length > 0) {
      whereTab.push(
        " t_donnee.id IN (" +
        getQueryToFindDonneesIdsByComportementsIds(criterion.comportements) +
        ")"
      );
    }

    // Filter by Milieux
    if (criterion.milieux && criterion.milieux.length > 0) {
      whereTab.push(
        " t_donnee.id IN (" +
        getQueryToFindDonneesIdsByMilieuxIds(criterion.milieux) +
        ")"
      );
    }

    if (whereTab.length > 0) {
      queryStr += " WHERE";
    }

    queryStr += whereTab.join(" AND ");
  }

  queryStr += " ORDER BY t_donnee.id DESC";

  return query<FlatDonnee[]>(queryStr);
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

export const queryToCountSpecimensBySexeForAnEspeceId = async (
  id: number
): Promise<{ name: string; value: number }[]> => {
  return query<{ name: string; value: number }[]>(
    "SELECT s.libelle as name, sum(nombre) as value" +
    " FROM donnee d " +
    " LEFT JOIN sexe s on s.id = d.sexe_id " +
    " WHERE espece_id = " +
    `${id}` +
    " GROUP BY sexe_id" +
    " ORDER BY s.libelle ASC"
  );
};

export const queryToCountSpecimensByAgeForAnEspeceId = async (
  id: number
): Promise<{ name: string; value: number }[]> => {
  return query<{ name: string; value: number }[]>(
    "SELECT a.libelle as name, sum(nombre) as value" +
    " FROM donnee d" +
    " LEFT JOIN age a on a.id = d.age_id" +
    " WHERE espece_id=" +
    `${id}` +
    " GROUP BY age_id" +
    " ORDER BY a.libelle ASC"
  );
};
