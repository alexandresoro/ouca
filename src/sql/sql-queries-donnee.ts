import * as _ from "lodash";
import moment from "moment";
import { getQuery } from "./sql-queries-utils";
export function getQueryToFindNumberOfDonnees(): string {
  return getQuery("SELECT COUNT(*) as nbDonnees FROM donnee");
}

export function getQueryToFindNextDonneeByCurrentDonneeId(
  currentDonneeId: number
): string {
  return getQuery(
    getBaseQueryToFindDonnees() +
      " AND d.id>" +
      currentDonneeId +
      " ORDER BY id ASC LIMIT 0,1"
  );
}

export function getQueryToFindPreviousDonneeByCurrentDonneeId(
  currentDonneeId: number
): string {
  return getQuery(
    getBaseQueryToFindDonnees() +
      " AND d.id<" +
      currentDonneeId +
      " ORDER BY d.id DESC LIMIT 0,1"
  );
}

export function getQueryToFindLastDonnee(): string {
  return getQuery(
    getBaseQueryToFindDonnees() + " ORDER BY d.id DESC LIMIT 0,1"
  );
}

export function getQueryToFindDonneeById(id: number): string {
  return getQuery(getBaseQueryToFindDonnees() + " AND d.id=" + id);
}

export function getQueryToFindDonneeIndexById(id: number): string {
  return getQuery("SELECT count(*) as nbDonnees FROM donnee WHERE id<=" + id);
}

export function getQueryToFindLastRegroupement(): string {
  return getQuery("SELECT MAX(d.regroupement) as regroupement FROM donnee d");
}

export function getQueryToFindNumberOfDonneesByDoneeeEntityId(
  entityIdAttribute: string,
  id?: number
): string {
  let query: string =
    "SELECT " + entityIdAttribute + " as id, count(*) as nbDonnees FROM donnee";
  if (!!id) {
    query = query + " WHERE " + entityIdAttribute + "=" + id;
  } else {
    query = query + " GROUP BY " + entityIdAttribute;
  }
  return getQuery(query);
}

export function getQueryToFindAllDonnees() {
  const query: string =
    getBaseQueryToFindDetailedDonnees() + " ORDER BY d.id DESC";

  return getQuery(query);
}

export const getQueryToFindDonneesByCriterion = (criterion: any): string => {
  let query: string = getBaseQueryToFindDetailedDonnees();

  const whereTab: string[] = [];

  if (criterion.id) {
    whereTab.push(" t_donnee.id=" + criterion.id);
  }

  if (criterion.especeGroup.classe && criterion.especeGroup.classe.id) {
    whereTab.push(" t_classe.id=" + criterion.especeGroup.classe.id);
  }

  if (criterion.especeGroup.espece && criterion.especeGroup.espece.id) {
    whereTab.push(" t_espece.id=" + criterion.especeGroup.espece.id);
  }

  if (
    criterion.lieuditGroup.departement &&
    criterion.lieuditGroup.departement.id
  ) {
    whereTab.push(" t_departement.id=" + criterion.lieuditGroup.departement.id);
  }

  if (criterion.lieuditGroup.commune && criterion.lieuditGroup.commune.id) {
    whereTab.push(" t_commune.id=" + criterion.lieuditGroup.commune.id);
  }

  if (criterion.lieuditGroup.lieudit && criterion.lieuditGroup.lieudit.id) {
    whereTab.push(" t_lieudit.id=" + criterion.lieuditGroup.lieudit.id);
  }

  if (criterion.sexe && criterion.sexe.id) {
    whereTab.push(" t_sexe.id=" + criterion.sexe.id);
  }

  if (criterion.age && criterion.age.id) {
    whereTab.push(" t_age.id=" + criterion.age.id);
  }

  if (
    criterion.nombreGroup.estimationNombre &&
    criterion.nombreGroup.estimationNombre.id
  ) {
    whereTab.push(
      " t_estim_nb.id=" + criterion.nombreGroup.estimationNombre.id
    );
  }

  if (
    criterion.distanceGroup.estimationDistance &&
    criterion.distanceGroup.estimationDistance.id
  ) {
    whereTab.push(
      " t_estim_dist.id=" + criterion.distanceGroup.estimationDistance.id
    );
  }

  if (criterion.observateur && criterion.observateur.id) {
    whereTab.push(" t_observateur.id=" + criterion.observateur.id);
  }

  if (criterion.fromDate) {
    whereTab.push(
      " t_inventaire.date>='" +
        moment(criterion.fromDate).format("YYYY-MM-DD") +
        "'"
    );
  }

  if (criterion.toDate) {
    whereTab.push(
      " t_inventaire.date<='" +
        moment(criterion.toDate).format("YYYY-MM-DD") +
        "'"
    );
  }

  if (criterion.temperature && Number.isInteger(criterion.temperature)) {
    whereTab.push(" t_inventaire.temperature=" + criterion.temperature);
  }

  if (
    criterion.nombreGroup.nombre &&
    Number.isInteger(criterion.nombreGroup.nombre)
  ) {
    whereTab.push(" t_donnee.nombre=" + criterion.nombreGroup.nombre);
  }

  if (
    criterion.distanceGroup.distance &&
    Number.isInteger(criterion.distanceGroup.distance)
  ) {
    whereTab.push(" t_donnee.distance=" + criterion.distanceGroup.distance);
  }

  if (criterion.regroupement && Number.isInteger(criterion.regroupement)) {
    whereTab.push(" t_donnee.regroupement=" + criterion.regroupement);
  }

  if (whereTab.length > 0) {
    query += " WHERE";
  }

  query += whereTab.join(" AND");

  query += " ORDER BY t_donnee.id DESC";

  return getQuery(query);
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
    " t_lieudit.altitude," +
    " t_lieudit.longitude," +
    " t_lieudit.latitude," +
    " t_inventaire.altitude as customizedAltitude," +
    " t_inventaire.longitude as customizedLongitude," +
    " t_inventaire.latitude as customizedLatitude," +
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

function getBaseQueryToFindDonnees() {
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
}
