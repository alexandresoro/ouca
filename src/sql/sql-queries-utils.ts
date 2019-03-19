import { EntiteSimple } from "basenaturaliste-model/entite-simple.object";
import * as _ from "lodash";

const createKeyValueMapWithSameName = (
  names: string | string[]
): { [key: string]: string } => {
  const returnMap = {};
  _.forEach(names, (name: string) => {
    returnMap[name] = name;
  });
  return returnMap;
};

export const DB_SAVE_MAPPING = {
  observateur: createKeyValueMapWithSameName("libelle"),
  departement: createKeyValueMapWithSameName("code"),
  commune: {
    ...createKeyValueMapWithSameName(["code", "nom"]),
    departement_id: "departementId"
  },
  lieudit: {
    ...createKeyValueMapWithSameName([
      "nom",
      "altitude",
      "longitude",
      "latitude"
    ]),
    commune_id: "communeId"
  },
  meteo: createKeyValueMapWithSameName("libelle"),
  classe: createKeyValueMapWithSameName("libelle"),
  espece: {
    ...createKeyValueMapWithSameName("code"),
    classe_id: "classeId",
    nom_francais: "nomFrancais",
    nom_latin: "nomLatin"
  },
  sexe: createKeyValueMapWithSameName("libelle"),
  age: createKeyValueMapWithSameName("libelle"),
  estimationNombre: {
    ...createKeyValueMapWithSameName("libelle"),
    nom_compte: "nonCompte"
  },
  estimationDistance: {
    ...createKeyValueMapWithSameName("libelle")
  },
  comportement: createKeyValueMapWithSameName(["code", "libelle"]),
  milieu: createKeyValueMapWithSameName(["code", "libelle"]),
  inventaire: {
    ...createKeyValueMapWithSameName([
      "date",
      "heure",
      "duree",
      "altitude",
      "longitude",
      "latitude",
      "temperature"
    ]),
    observateur_id: "observateurId",
    lieudit_id: "lieuditId"
  },
  donnee: {
    ...createKeyValueMapWithSameName([
      "nombre",
      "distance",
      "regroupement",
      "commentaire"
    ]),
    espece_id: "especeId",
    age_id: "ageId",
    sexe_id: "sexeId",
    estimation_nombre_id: "estimationNombreId",
    estimation_distance_id: "estimationDistanceId"
  },
  configuration: createKeyValueMapWithSameName(["libelle", "value"])
};

function getQuery(query: string): string {
  console.log("---> " + query + ";");
  return query + ";";
}

export const getAllFromTablesQuery = (tableNames: string[]): string => {
  return _.reduce(
    _.map(tableNames, (tableName) => {
      return getFindAllQuery(tableName);
    }),
    (first, second) => {
      return first + second;
    }
  );
};

export function getFindAllQuery(
  tableName: string,
  attributeForOrdering?: string,
  order?: string
) {
  let query: string = "SELECT * FROM " + tableName;

  if (!!attributeForOrdering && !!order) {
    query = query + " ORDER BY " + attributeForOrdering + " " + order;
  }

  return getQuery(query);
}

export function getFindOneByIdQuery(tableName: string, id: number) {
  return getQuery("SELECT * FROM " + tableName + " WHERE id=" + id);
}

export function getFindNumberOfDonneesByObservateurIdQuery(
  observateurId?: number
): string {
  return getFindNumberOfDonneesByInventaireEntityIdQuery(
    "observateur_id",
    observateurId
  );
}

export function getFindNumberOfDonneesByLieuditIdQuery(
  lieuditId?: number
): string {
  return getFindNumberOfDonneesByInventaireEntityIdQuery(
    "lieudit_id",
    lieuditId
  );
}

export function getFindNumberOfCommunesByDepartementIdQuery(
  departementId?: number
): string {
  let query: string = "SELECT c.departement_id, count(*) FROM commune c";
  if (!!departementId) {
    query = query + " WHERE c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return getQuery(query);
}

export function getFindNumberOfLieuxditsByDepartementIdQuery(
  departementId?: number
): string {
  let query: string =
    "SELECT c.departement_id, count(*) FROM commune c, lieudit l WHERE c.id=l.commune_id";
  if (!!departementId) {
    query = query + " AND c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return getQuery(query);
}

export function getFindNumberOfLieuxditsByCommuneIdQuery(
  communeId?: number
): string {
  let query: string = "SELECT c.commune_id, count(*) FROM lieudit l";
  if (!!communeId) {
    query = query + " WHERE l.commune_id=" + communeId;
  } else {
    query = query + " GROUP BY l.commune_id";
  }
  return getQuery(query);
}

export function getFindNumberOfEspecesByClasseIdQuery(
  classeId?: number
): string {
  let query: string = "SELECT classe_id, count(*) FROM espece";
  if (!!classeId) {
    query = query + " WHERE classe_id=" + classeId;
  } else {
    query = query + " GROUP BY classe_id";
  }
  return getQuery(query);
}

export function getFindNumberOfDonneesByClasseIdQuery(
  classeId?: number
): string {
  let query: string =
    "SELECT e.classe_id, count(*) FROM espece e, donnee d WHERE d.espece_id=e.id";
  if (!!classeId) {
    query = query + " AND e.classe_id=" + classeId;
  } else {
    query = query + " GROUP BY classe_id";
  }
  return getQuery(query);
}

export function getFindNumberOfDonneesByEspeceIdQuery(
  especeId?: number
): string {
  return getFindNumberOfDonneesByDoneeeEntityIdQuery("espece_id", especeId);
}

export function getFindNumberOfDonneesByEstimationNombreIdQuery(
  estimationId?: number
): string {
  return getFindNumberOfDonneesByDoneeeEntityIdQuery(
    "estimation_nombre_id",
    estimationId
  );
}

export function getFindNumberOfDonneesBySexeIdQuery(sexeId?: number): string {
  return getFindNumberOfDonneesByDoneeeEntityIdQuery("sexe_id", sexeId);
}

export function getFindNumberOfDonneesByAgeIdQuery(ageId?: number): string {
  return getFindNumberOfDonneesByDoneeeEntityIdQuery("age_id", ageId);
}

export function getFindNumberOfDonneesByDoneeeEntityIdQuery(
  entityIdAttribute: string,
  id?: number
): string {
  let query: string = "SELECT " + entityIdAttribute + ", count(*) FROM donnee";
  if (!!id) {
    query = query + " AND " + entityIdAttribute + "=" + id;
  } else {
    query = query + " GROUP BY " + entityIdAttribute;
  }
  return getQuery(query);
}

export function getFindNumberOfDonneesByInventaireEntityIdQuery(
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
  return getQuery(query);
}

export function getSaveEntityQuery(
  tableName: string,
  entityToSave: EntiteSimple,
  mapping: { [column: string]: string }
): string {
  let query: string;

  if (!entityToSave.id) {
    const columnNames = _.reduce(_.keys(mapping), (sum, b) => {
      return sum + "," + b;
    });

    const values = _.reduce(_.values(mapping), (sum, b) => {
      return sum + "," + entityToSave[b];
    });

    query =
      "INSERT INTO " +
      tableName +
      "(" +
      columnNames +
      ")" +
      "VALUES (" +
      values +
      ")";
  } else {
    const updates = _.reduce(_.keys(mapping), (sum, b) => {
      return sum + "," + b + "=" + entityToSave[mapping[b]];
    });

    query =
      "UDPATE " +
      tableName +
      " SET " +
      updates +
      " WHERE id=" +
      entityToSave.id;
  }

  return getQuery(query);
}

export function getDeleteEntityByIdQuery(
  tableName: string,
  id: number
): string {
  return getQuery("DELETE FROM " + tableName + " WHERE id=" + id);
}

export function getFindLastRegroupementQuery(): string {
  return getQuery("SELECT MAX(d.regroupement) as regroupement FROM donnee d");
}

export function getFindLastDonneeQuery(): string {
  return getQuery("SELECT * FROM donnee d ORDER BY id DESC LIMIT 0,1");
}

export function getFindPreviousDonneeByCurrentDonneeIdQuery(
  currentDonneeId: number
): string {
  return getQuery(
    "SELECT * FROM donnee d WHERE d.id<" +
      currentDonneeId +
      " ORDER BY d.id DESC LIMIT 0,1"
  );
}

export function getFindNextDonneeByCurrentDonneeIdQuery(
  currentDonneeId: number
): string {
  return getQuery(
    "SELECT * FROM donnee d WHERE d.id>" +
      currentDonneeId +
      " ORDER BY id ASC LIMIT 0,1"
  );
}

export function getFindConfigurationByLibelleQuery(libelle: string) {
  return getQuery(
    "SELECT * FROM configuration WHERE libelle='" + libelle + "'"
  );
}

export function getFindNumberOfDonneesQuery(): string {
  return getQuery("SELECT COUNT(*) as nbDonnees FROM donnee");
}
