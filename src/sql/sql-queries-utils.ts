import * as _ from "lodash";
import { COLUMN_ESPECE_ID } from "../utils/constants";

const createKeyValueMapWithSameName = (
  names: string | string[]
): { [key: string]: string } => {
  const returnMap = {};
  _.forEach(typeof names === "string" ? [names] : names, (name: string) => {
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
    non_compte: "nonCompte"
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
    lieudit_id: "lieuditId",
    date_creation: "dateCreation"
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
    estimation_distance_id: "estimationDistanceId",
    date_creation: "dateCreation"
  },
  configuration: createKeyValueMapWithSameName(["libelle", "value"])
};

export const DB_SAVE_LISTS_MAPPING = {
  inventaire_associe: {
    mainId: "inventaire_id",
    subId: "associe_id"
  },
  inventaire_meteo: {
    mainId: "inventaire_id",
    subId: "meteo_id"
  },
  donnee_comportement: {
    mainId: "donnee_id",
    subId: "comportement_id"
  },
  donnee_milieu: {
    mainId: "donnee_id",
    subId: "milieu_id"
  }
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

export function getFindNumberOfDonneesByDepartementIdQuery(
  departementId?: number
): string {
  let query: string =
    "SELECT c.departement_id as id, count(*) as nbDonnees " +
    "FROM donnee d, inventaire i, commune c, lieudit l " +
    "WHERE d.inventaire_id=i.id AND i.lieudit_id=l.id AND c.id=l.commune_id";
  if (!!departementId) {
    query = query + " AND c.departement_id=" + departementId;
  } else {
    query = query + " GROUP BY c.departement_id";
  }
  return getQuery(query);
}

export function getFindNumberOfDonneesByCommuneIdQuery(
  communeId?: number
): string {
  let query: string =
    "SELECT l.commune_id as id, count(*) as nbDonnees " +
    "FROM donnee d, inventaire i, lieudit l WHERE d.inventaire_id=i.id AND i.lieudit_id=l.id";
  if (!!communeId) {
    query = query + " AND l.commune_id=" + communeId;
  } else {
    query = query + " GROUP BY l.commune_id";
  }
  return getQuery(query);
}

export function getFindNumberOfCommunesByDepartementIdQuery(
  departementId?: number
): string {
  let query: string =
    "SELECT c.departement_id as id, count(*) as nbCommunes FROM commune c";
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
    "SELECT c.departement_id as id, count(*) as nbLieuxdits FROM commune c, lieudit l WHERE c.id=l.commune_id";
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
  let query: string =
    "SELECT l.commune_id as id, count(*) as nbLieuxdits FROM lieudit l";
  if (!!communeId) {
    query = query + " WHERE l.commune_id=" + communeId;
  } else {
    query = query + " GROUP BY l.commune_id";
  }
  return getQuery(query);
}

export function getFindNumberOfDonneesByMeteoIdQuery(meteoId?: number): string {
  let query: string =
    "SELECT im.meteo_id as id, count(*) as nbDonnees " +
    "FROM inventaire_meteo im, donnee d " +
    "WHERE d.inventaire_id=im.inventaire_id";
  if (!!meteoId) {
    query = query + " AND im.meteo_id=" + meteoId;
  } else {
    query = query + " GROUP BY im.meteo_id";
  }
  return getQuery(query);
}

export function getFindNumberOfDonneesByComportementIdQuery(
  comportementId?: number
): string {
  let query: string =
    "SELECT dc.comportement_id as id, count(*) as nbDonnees " +
    "FROM donnee_comportement dc ";
  if (!!comportementId) {
    query = query + " WHERE dc.comportement_id=" + comportementId;
  } else {
    query = query + " GROUP BY dc.comportement_id";
  }
  return getQuery(query);
}

export function getFindNumberOfDonneesByMilieuIdQuery(
  milieuId?: number
): string {
  let query: string =
    "SELECT dc.milieu_id as id, count(*) as nbDonnees " +
    "FROM donnee_milieu dc ";
  if (!!milieuId) {
    query = query + " WHERE dc.milieu_id=" + milieuId;
  } else {
    query = query + " GROUP BY dc.milieu_id";
  }
  return getQuery(query);
}

export function getFindNumberOfEspecesByClasseIdQuery(
  classeId?: number
): string {
  let query: string =
    "SELECT classe_id as id, count(*) as nbEspeces FROM espece";
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
    "SELECT e.classe_id as id, count(*) as nbDonnees FROM espece e, donnee d WHERE d.espece_id=e.id";
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
  return getFindNumberOfDonneesByDoneeeEntityIdQuery(
    COLUMN_ESPECE_ID,
    especeId
  );
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

export function getFindNumberOfDonneesByEstimationDistanceIdQuery(
  estimationDistanceId?: number
): string {
  return getFindNumberOfDonneesByDoneeeEntityIdQuery(
    "estimation_distance_id",
    estimationDistanceId
  );
}

export function getFindNumberOfDonneesByDoneeeEntityIdQuery(
  entityIdAttribute: string,
  id?: number
): string {
  let query: string =
    "SELECT " + entityIdAttribute + " as id, count(*) as nbDonnees FROM donnee";
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
    " as id, count(*) as nbDonnees FROM donnee d, inventaire i WHERE d.inventaire_id=i.id";
  if (!!id) {
    query = query + " AND i." + entityIdAttribute + "=" + id;
  } else {
    query = query + " GROUP BY i." + entityIdAttribute;
  }
  return getQuery(query);
}

export function getSaveEntityQuery(
  tableName: string,
  entityToSave: any,
  mapping: { [column: string]: string }
): string {
  let query: string;

  const keys: string[] = _.keys(mapping);

  if (!entityToSave.id) {
    const columnNames = keys.join(",");

    const valuesArray = [];
    _.forEach(keys, (key: string) => {
      // If the value is 'null'
      if (_.isNull(entityToSave[mapping[key]])) {
        valuesArray.push("null");
      } else if (_.isBoolean(entityToSave[mapping[key]])) {
        valuesArray.push(entityToSave[mapping[key]]);
      } else {
        valuesArray.push("'" + entityToSave[mapping[key]] + "'");
      }
    });
    const values = valuesArray.join(",");

    query =
      "INSERT INTO " +
      tableName +
      "(" +
      columnNames +
      ") " +
      "VALUES (" +
      values +
      ")";
  } else {
    const updatesArray = [];
    _.forEach(keys, (key: string) => {
      updatesArray.push(key + "='" + entityToSave[mapping[key]] + "'");
    });
    const updates = updatesArray.join(",");

    query =
      "UPDATE " +
      tableName +
      " SET " +
      updates +
      " WHERE id=" +
      entityToSave.id;
  }

  return getQuery(query);
}

export function getSaveListOfEntitesQueries(
  tableName: string,
  mainId: number,
  subIds: any[]
): string {
  let queries: string = "";
  subIds.forEach((subId) => {
    queries += getSaveManyToManyEntityQuery(tableName, mainId, subId);
  });
  return queries;
}
export function getSaveManyToManyEntityQuery(
  tableName: string,
  mainId: number,
  subId: number
): string {
  const query: string =
    "INSERT INTO " +
    tableName +
    "(" +
    DB_SAVE_LISTS_MAPPING[tableName].mainId +
    "," +
    DB_SAVE_LISTS_MAPPING[tableName].subId +
    ") " +
    "VALUES (" +
    mainId +
    "," +
    subId +
    ")";

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
  const fields =
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
    "d.regroupement";
  return getQuery(
    "SELECT " +
      fields +
      " FROM donnee d, inventaire i WHERE d.inventaire_id=i.id AND d.id<" +
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

export function getFindAssociesByInventaireIdQuery(
  inventaireId: number
): string {
  return getQuery(
    "SELECT distinct observateur_id as comportementId FROM inventaire_associe WHERE inventaire_id=" +
      inventaireId
  );
}

export function getFindMetosByInventaireIdQuery(inventaireId: number): string {
  return getQuery(
    "SELECT distinct meteo_id as meteoId FROM inventaire_meteo WHERE inventaire_id=" +
      inventaireId
  );
}

export function getFindComportementsByDonneeIdQuery(donneeId: number): string {
  return getQuery(
    "SELECT distinct comportement_id as comportementId FROM donnee_comportement WHERE donnee_id=" +
      donneeId
  );
}

export function getFindMilieuxByDonneeIdQuery(donneeId: number): string {
  return getQuery(
    "SELECT distinct milieu_id as milieuId FROM donnee_milieu WHERE donnee_id=" +
      donneeId
  );
}
