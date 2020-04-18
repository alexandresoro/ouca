import * as _ from "lodash";
import { EntiteSimple } from "ouca-common/entite-simple.object";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  DONNEE_ID,
  INVENTAIRE_ID,
  METEO_ID,
  OBSERVATEUR_ID
} from "../utils/constants";

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
      "commune_id",
      "nom",
      "altitude",
      "longitude",
      "latitude",
      "coordinates_system"
    ])
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
    date_creation: "dateCreation",
    coordinates_system: "coordinatesSystem"
  },
  donnee: {
    ...createKeyValueMapWithSameName([
      "nombre",
      "distance",
      "regroupement",
      "commentaire"
    ]),
    inventaire_id: "inventaireId",
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
    mainId: INVENTAIRE_ID,
    subId: OBSERVATEUR_ID
  },
  inventaire_meteo: {
    mainId: INVENTAIRE_ID,
    subId: METEO_ID
  },
  donnee_comportement: {
    mainId: DONNEE_ID,
    subId: "comportement_id"
  },
  donnee_milieu: {
    mainId: DONNEE_ID,
    subId: "milieu_id"
  }
};

export const DB_CONFIGURATION_MAPPING = createKeyValueMapWithSameName([
  "default_observateur_id",
  "default_departement_id",
  "default_age_id",
  "default_sexe_id",
  "default_estimation_nombre_id",
  "default_nombre",
  "are_associes_displayed",
  "is_meteo_displayed",
  "is_distance_displayed",
  "is_regroupement_displayed",
  "coordinates_system"
]);

export function query<T>(query: string): Promise<T> {
  console.log("---> " + query + ";");
  return SqlConnection.query(query + ";");
}

/** Deprecated: replaced by query() */
export const getQuery = (query: string): string => {
  console.log("---> " + query + ";");
  return query + ";";
};

export const queryToFindAllEntities = async <T>(
  tableName: string,
  attributeForOrdering?: string,
  order?: string
): Promise<T[]> => {
  let queryStr: string = "SELECT * FROM " + tableName;

  if (!!attributeForOrdering && !!order) {
    queryStr = queryStr + " ORDER BY " + attributeForOrdering + " " + order;
  }

  return query<T[]>(queryStr);
};

/** Deprecated: replaced by queryToFindAllEntities */
export function getFindAllQuery(
  tableName: string,
  attributeForOrdering?: string,
  order?: string
): string {
  let query: string = "SELECT * FROM " + tableName;

  if (!!attributeForOrdering && !!order) {
    query = query + " ORDER BY " + attributeForOrdering + " " + order;
  }

  return getQuery(query);
}

export const getFindAllSqlQuery = (tableName: string): Promise<any> => {
  return SqlConnection.query(getFindAllQuery(tableName));
};

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

export const getAllFromTablesSqlQuery = (
  tableNames: string[]
): Promise<any>[] => {
  return _.map(tableNames, (tableName) => {
    return getFindAllSqlQuery(tableName);
  });
};

export const getQueryToFindOneById = (
  tableName: string,
  id: number
): string => {
  return getQuery("SELECT * FROM " + tableName + " WHERE id=" + id);
};

export function getSaveEntityQuery<T extends EntiteSimple>(
  tableName: string,
  entityToSave: T,
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
      } else if (_.isString(entityToSave[mapping[key]])) {
        valuesArray.push('"' + entityToSave[mapping[key]].trim() + '"');
      } else {
        valuesArray.push('"' + entityToSave[mapping[key]] + '"');
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
      // If the value is 'null'
      if (_.isNull(entityToSave[mapping[key]])) {
        updatesArray.push(key + "=null");
      } else if (_.isBoolean(entityToSave[mapping[key]])) {
        updatesArray.push(key + "=" + entityToSave[mapping[key]]);
      } else if (_.isString(entityToSave[mapping[key]])) {
        updatesArray.push(key + '="' + entityToSave[mapping[key]].trim() + '"');
      } else {
        updatesArray.push(key + '="' + entityToSave[mapping[key]] + '"');
      }
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

export function getSaveListOfEntitesQueries(
  tableName: string,
  mainId: number,
  subIds: number[]
): string {
  let queries = "";
  subIds.forEach((subId) => {
    queries += getSaveManyToManyEntityQuery(tableName, mainId, subId);
  });
  return queries;
}

export const updateInTableQuery = (
  tableName: string,
  setColumn: string,
  setValue: string | number,
  whereColumn: string,
  whereValue: string
): string => {
  const query: string =
    "UPDATE " +
    tableName +
    " SET " +
    setColumn +
    '="' +
    setValue +
    '" WHERE ' +
    whereColumn +
    '="' +
    whereValue +
    '"';
  return getQuery(query);
};

export const updateAllInTableQuery = (
  tableName: string,
  setColumn: string,
  whereColumn: string,
  whereSetMappingValues: { [key: string]: string | number }
): string => {
  const queries: string[] = [];
  _.forEach(whereSetMappingValues, (setValue, whereValue) => {
    queries.push(
      updateInTableQuery(
        tableName,
        setColumn,
        setValue,
        whereColumn,
        whereValue
      )
    );
  });
  return queries.join("");
};

export function getDeleteEntityByIdQuery(
  tableName: string,
  id: number
): string {
  return getQuery("DELETE FROM " + tableName + " WHERE id=" + id);
}

export function getDeleteEntityByAttributeQuery(
  tableName: string,
  attributeName: string,
  attributeValue: string | number
): string {
  return getQuery(
    "DELETE FROM " +
      tableName +
      " WHERE " +
      attributeName +
      '="' +
      attributeValue +
      '"'
  );
}

export function getQueryToFindEntityByLibelle(
  entityName: string,
  libelle: string
): string {
  return getQuery(
    "SELECT * FROM " + entityName + ' WHERE libelle="' + libelle.trim() + '"'
  );
}

export function getQueryToFindEntityByCode(
  entityName: string,
  code: string
): string {
  return getQuery(
    "SELECT * FROM " + entityName + ' WHERE code="' + code.trim() + '"'
  );
}

export function getQueryToFindEntityByCodeAndLibelle(
  entityName: string,
  code: string,
  libelle: string
): string {
  return getQuery(
    "SELECT * FROM " +
      entityName +
      ' WHERE code="' +
      code.trim() +
      '" AND libelle="' +
      libelle.trim() +
      '"'
  );
}
