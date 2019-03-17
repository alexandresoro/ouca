export function getAllFromTableQuery(
  tableName: string,
  attributeForOrdering?: string,
  order?: string
) {
  let query: string = "SELECT * FROM " + tableName;

  if (!!attributeForOrdering && !!order) {
    query = query + " ORDER BY " + attributeForOrdering + " " + order;
  }

  return query;
}

export function getNumberOfDonneesByObservateurIdQuery(
  observateurId?: number
): string {
  return getNumberOfDonneesByInventaireEntityIdQuery(
    "observateur_id",
    observateurId
  );
}

export function getNumberOfDonneesByLieuditIdQuery(lieuditId?: number): string {
  return getNumberOfDonneesByInventaireEntityIdQuery("lieudit_id", lieuditId);
}

export function getNumberOfCommunesByDepartementIdQuery(
  departementId?: number
): string {
  let query: string = "SELECT c.departement_id, count(*) FROM commune c";
  if (!!departementId) {
    query = query + " WHERE c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return query;
}

export function getNumberOfLieuxditsByDepartementIdQuery(
  departementId?: number
): string {
  let query: string =
    "SELECT c.departement_id, count(*) FROM commune c, lieudit l WHERE c.id=l.commune_id";
  if (!!departementId) {
    query = query + " AND c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return query;
}

export function getNumberOfLieuxditsByCommuneIdQuery(
  communeId?: number
): string {
  let query: string = "SELECT c.commune_id, count(*) FROM lieudit l";
  if (!!communeId) {
    query = query + " WHERE l.commune_id=" + communeId;
  } else {
    query = query + " GROUP BY l.commune_id";
  }
  return query;
}

export function getNumberOfEspecesByClasseIdQuery(classeId?: number): string {
  if (!!classeId) {
    return "SELECT classe_id, count(*) FROM espece WHERE classe_id=" + classeId;
  } else {
    return "SELECT classe_id, count(*) FROM espece GROUP BY classe_id";
  }
}

export function getNumberOfDonneesByClasseIdQuery(classeId?: number): string {
  let query: string =
    "SELECT e.classe_id, count(*) FROM espece e, donnee d WHERE d.espece_id=e.id";
  if (!!classeId) {
    query = query + " AND e.classe_id=" + classeId;
  } else {
    query = query + " GROUP BY classe_id";
  }
  return query;
}

export function getNumberOfDonneesByEspeceIdQuery(especeId?: number): string {
  return getNumberOfDonneesByDoneeeEntityIdQuery("espece_id", especeId);
}

export function getNumberOfDonneesByEstimationNombreIdQuery(
  estimationId?: number
): string {
  return getNumberOfDonneesByDoneeeEntityIdQuery(
    "estimation_nombre_id",
    estimationId
  );
}

export function getNumberOfDonneesBySexeIdQuery(sexeId?: number): string {
  return getNumberOfDonneesByDoneeeEntityIdQuery("sexe_id", sexeId);
}

export function getNumberOfDonneesByAgeIdQuery(ageId?: number): string {
  return getNumberOfDonneesByDoneeeEntityIdQuery("age_id", ageId);
}

export function getNumberOfDonneesByDoneeeEntityIdQuery(
  entityIdAttribute: string,
  id?: number
): string {
  let query: string = "SELECT " + entityIdAttribute + ", count(*) FROM donnee";
  if (!!id) {
    query = query + " AND " + entityIdAttribute + "=" + id;
  } else {
    query = query + " GROUP BY " + entityIdAttribute;
  }
  return query;
}

export function getNumberOfDonneesByInventaireEntityIdQuery(
  entityIdAttribute: string,
  id?: number
): string {
  let query: string =
    "SELECT i." +
    entityIdAttribute +
    ", count(*) FROM donnee d, inventaire i WHERE d.inventaire_id=i.id";
  if (!!id) {
    query = query + " AND i." + entityIdAttribute + "=" + id;
  } else {
    query = query + " GROUP BY i." + entityIdAttribute;
  }
  return query;
}
