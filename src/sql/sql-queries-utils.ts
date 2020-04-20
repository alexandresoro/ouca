import * as _ from "lodash";
import { EntiteSimple } from "ouca-common/entite-simple.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
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

export const queryToFindOneById = async <T>(
  tableName: string,
  id: number
): Promise<T[]> => {
  return query<T[]>("SELECT * FROM " + tableName + " WHERE id=" + id);
};

export const queryToSaveEntity = async <T extends EntiteSimple>(
  tableName: string,
  entityToSave: T,
  mapping: { [column: string]: string }
): Promise<SqlSaveResponse> => {
  let queryStr: string;

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

    queryStr =
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

    queryStr =
      "UPDATE " +
      tableName +
      " SET " +
      updates +
      " WHERE id=" +
      entityToSave.id;
  }

  return query<SqlSaveResponse>(queryStr);
};

export const queryToSaveManyToManyEntity = async (
  tableName: string,
  mainId: number,
  subId: number
): Promise<SqlSaveResponse> => {
  const queryStr: string =
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

  return query<SqlSaveResponse>(queryStr);
};

export const queriesToSaveListOfEntities = async (
  tableName: string,
  mainId: number,
  subIds: number[]
): Promise<SqlSaveResponse[]> => {
  const queries = [];
  subIds.forEach((subId) => {
    queries.push(queryToSaveManyToManyEntity(tableName, mainId, subId));
  });
  //return queries;
  return Promise.all(queries);
};

export const queryToDeleteAnEntityById = async (
  tableName: string,
  id: number
): Promise<SqlSaveResponse> => {
  return query<SqlSaveResponse>("DELETE FROM " + tableName + " WHERE id=" + id);
};

export const queryToDeleteAnEntityByAttribute = async (
  tableName: string,
  attributeName: string,
  attributeValue: string | number
): Promise<SqlSaveResponse> => {
  return query<SqlSaveResponse>(
    "DELETE FROM " +
      tableName +
      " WHERE " +
      attributeName +
      '="' +
      attributeValue +
      '"'
  );
};

export const queryToFindEntityByLibelle = async <T>(
  entityName: string,
  libelle: string
): Promise<T> => {
  return query<T>(
    "SELECT * FROM " + entityName + ' WHERE libelle="' + libelle.trim() + '"'
  );
};

export const queryToFindEntityByCode = async <T>(
  entityName: string,
  code: string
): Promise<T> => {
  return query<T>(
    "SELECT * FROM " + entityName + ' WHERE code="' + code.trim() + '"'
  );
};

export const queryToFindEntityByCodeAndLibelle = async <T>(
  entityName: string,
  code: string,
  libelle: string
): Promise<T> => {
  return query<T>(
    "SELECT * FROM " +
      entityName +
      ' WHERE code="' +
      code.trim() +
      '" AND libelle="' +
      libelle.trim() +
      '"'
  );
};
