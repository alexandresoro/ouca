import { EntityDb } from "../objects/db/entity-db.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  DONNEE_ID,
  INVENTAIRE_ID,
  METEO_ID,
  OBSERVATEUR_ID
} from "../utils/constants";
import { logger } from "../utils/logger";

const createKeyValueMapWithSameName = (
  names: string | string[]
): Map<string, string> => {
  return new Map(([] as string[]).concat(names).map(name => [name, name]));
};

export const DB_SAVE_MAPPING = new Map(Object.entries({
  observateur: createKeyValueMapWithSameName("libelle"),
  departement: createKeyValueMapWithSameName("code"),
  commune: new Map([
    ...createKeyValueMapWithSameName(["code", "nom"]),
    ["departement_id", "departementId"]
  ]),
  meteo: createKeyValueMapWithSameName("libelle"),
  classe: createKeyValueMapWithSameName("libelle"),
  espece: new Map([
    ...createKeyValueMapWithSameName("code"),
    ["classe_id", "classeId"],
    ["nom_francais", "nomFrancais"],
    ["nom_latin", "nomLatin"]
  ]),
  sexe: createKeyValueMapWithSameName("libelle"),
  age: createKeyValueMapWithSameName("libelle"),
  estimationNombre: new Map([
    ...createKeyValueMapWithSameName("libelle"),
    ["non_compte", "nonCompte"]
  ]),
  estimationDistance: createKeyValueMapWithSameName("libelle"),
  milieu: createKeyValueMapWithSameName(["code", "libelle"]),
  donnee: new Map([
    ...createKeyValueMapWithSameName([
      "nombre",
      "distance",
      "regroupement",
      "commentaire"
    ]),
    ["inventaire_id", "inventaireId"],
    ["espece_id", "especeId"],
    ["age_id", "ageId"],
    ["sexe_id", "sexeId"],
    ["estimation_nombre_id", "estimationNombreId"],
    ["estimation_distance_id", "estimationDistanceId"],
    ["date_creation", "dateCreation"]
  ]),
  configuration: createKeyValueMapWithSameName(["libelle", "value"])
}));

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

export function query<T>(query: string): Promise<T> {
  logger.debug(`---> ${query};`);
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
  return query<T[]>(`SELECT * FROM ${tableName} WHERE id=${id}`);
};

export const queryToSaveEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: T,
  mapping?: Map<string, string>
): Promise<SqlSaveResponse> => {

  let queryStr: string;

  const { id, ...entityToSaveWithoutId } = entityToSave;

  const dbEntityToSaveAsArray = Object.entries(entityToSaveWithoutId)
    .filter(([entityKey, entityValue]) => {
      // Filter the entries to the ones defined in the mapping
      // Otherwise, keep them all
      // This is to avoid to store invalid columns in the DB
      return !mapping || (mapping.values() && [...mapping.values()].includes(entityKey));
    })
    .map(([key, value]) => {

      const columnDb = (mapping && [...mapping].find(([mappingKey, mappingValue]) => {
        return mappingValue === key
      })?.[0]) ?? key;

      // Set the proper value in DB format
      let valueDb: string;
      if (value == null) {
        valueDb = "null";
      } else if (typeof value === 'boolean') {
        valueDb = (value ? "TRUE" : "FALSE");
      } else if (typeof value === 'string') {
        valueDb = '"' + value.trim().replace(/"/g, '\\"') + '"';
      } else {
        valueDb = '"' + value + '"';
      }

      return [columnDb, valueDb];
    });

  if (!entityToSave.id) {
    const columnNames = dbEntityToSaveAsArray.map((elt) => {
      return elt[0];
    }).join(",");

    const values = dbEntityToSaveAsArray.map((elt) => {
      return elt[1];
    }).join(",");

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
    const updates = dbEntityToSaveAsArray.map((elt) => {
      return elt[0] + "=" + elt[1];
    }).join(",");

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
    "SELECT * FROM " + entityName + ' WHERE libelle="' + libelle.trim().replace(/"/g, '\\"') + '"'
  );
};

export const queryToFindEntityByCode = async <T>(
  entityName: string,
  code: string
): Promise<T> => {
  return query<T>(
    "SELECT * FROM " + entityName + ' WHERE code="' + code.trim().replace(/"/g, '\\"') + '"'
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
    code.trim().replace(/"/g, '\\"') +
    '" AND libelle="' +
    libelle.trim().replace(/"/g, '\\"') +
    '"'
  );
};
