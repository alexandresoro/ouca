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
    "SELECT d.id," +
    " i.id as inventaireId," +
    " o.libelle as observateur," +
    " i.date," +
    " i.heure," +
    " i.duree, " +
    " dept.code as departement," +
    " c.code as codeCommune," +
    " c.nom as nomCommune," +
    " l.nom as lieudit," +
    " l.altitude," +
    " l.longitude," +
    " l.latitude," +
    " i.altitude as customizedAltitude," +
    " i.longitude as customizedLongitude," +
    " i.latitude as customizedLatitude," +
    " i.temperature, " +
    " classe.libelle as classe," +
    " e.code as codeEspece," +
    " e.nom_francais as nomFrancais," +
    " e.nom_latin as nomLatin, " +
    " t_sexe.libelle as sexe," +
    " t_age.libelle as age," +
    " t_estim_nb.libelle as estimationNombre," +
    " d.nombre," +
    " t_estim_dist.libelle as estimationDistance," +
    " d.distance," +
    " d.regroupement," +
    " d.commentaire" +
    " FROM donnee d" +
    " LEFT JOIN inventaire i ON d.inventaire_id = i.id" +
    " LEFT JOIN observateur o ON i.observateur_id = o.id" +
    " LEFT JOIN lieudit l ON i.lieudit_id = l.id" +
    " LEFT JOIN commune c ON l.commune_id = c.id" +
    " LEFT JOIN departement dept ON c.departement_id = dept.id" +
    " LEFT JOIN espece e ON d.espece_id = e.id" +
    " LEFT JOIN classe classe ON e.classe_id = classe.id" +
    " LEFT JOIN sexe t_sexe ON d.sexe_id = t_sexe.id" +
    " LEFT JOIN age t_age ON d.age_id = t_age.id" +
    " LEFT JOIN estimation_nombre t_estim_nb ON d.estimation_nombre_id = t_estim_nb.id " +
    " LEFT JOIN estimation_distance t_estim_dist ON d.estimation_distance_id = t_estim_dist.id" +
    " ORDER BY d.id DESC";

  return getQuery(query);
}

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
