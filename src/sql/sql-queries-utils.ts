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
  logger.debug(`Executing SQL query : 
  ${query};`);
  return SqlConnection.query(query + ";");
}

export const queryToFindAllEntities = async <T>(
  tableName: string,
  attributeForOrdering?: string,
  order?: string
): Promise<T[]> => {
  let queryStr = `SELECT * FROM ${tableName}`;

  if (attributeForOrdering && order) {
    queryStr = queryStr +
      ` ORDER BY ${attributeForOrdering} ${order}`;
  }

  return query<T[]>(queryStr);
};

export const queryToFindOneById = async <T>(
  tableName: string,
  id: number
): Promise<T> => {
  const results = await query<T[]>(`SELECT * FROM ${tableName} WHERE id=${id}`);
  return getFirstResult<T>(results);
};

// Method that processes an entity to be saved, in order to be used directly in the SQL query
// It basically takes an object T, strips the 'id' property, 
// filters the properties for which there is no corresponding DB column, 
// and return and array of elements, each element being an array of size 2, the db column name and the value to be set
// e.g. for an object {"id": 1, "toto": "titi", "tutu": 6} it will return
// [["toto", "titi"], ["tutu", "6"]]
const processEntityToSave = <T extends EntityDb>(
  entityToSave: T,
  mapping?: Map<string, string>
): string[][] => {

  const { id, ...entityToSaveWithoutId } = entityToSave;

  return Object.entries(entityToSaveWithoutId)
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

        valueDb = '"' + prepareStringForSqlQuery(value) + '"';
      } else {
        valueDb = '"' + value + '"';
      }

      return [columnDb, valueDb];
    });

}

export const queryToSaveEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: T,
  mapping?: Map<string, string>
): Promise<SqlSaveResponse> => {

  const dbEntityToSaveAsArray = processEntityToSave(entityToSave, mapping);

  let queryStr: string;
  if (!entityToSave.id) {
    const columnNames = dbEntityToSaveAsArray.map((elt) => {
      return elt[0];
    }).join(",");

    const values = dbEntityToSaveAsArray.map((elt) => {
      return elt[1];
    }).join(",");

    queryStr = `INSERT INTO ${tableName} (${columnNames}) VALUES (${values})`;
  } else {
    const updates = dbEntityToSaveAsArray.map((elt) => {
      return `${elt[0]}=${elt[1]}`;
    }).join(",");

    queryStr = `UPDATE ${tableName} SET ${updates} WHERE id=${entityToSave.id}`;
  }

  return query<SqlSaveResponse>(queryStr);
};

export const queryToInsertMultipleEntities = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: T[],
  mapping?: Map<string, string>
): Promise<SqlSaveResponse> => {
  const dbEntitiesToSaveAsArray = entitiesToSave.map(entity => processEntityToSave(entity, mapping));

  const columnNames = dbEntitiesToSaveAsArray[0].map((elt) => {
    return elt[0];
  }).join(",");

  const allValues = dbEntitiesToSaveAsArray
    .map((dbEntityToSaveAsArray) => {
      const values = dbEntityToSaveAsArray.map((elt) => {
        return elt[1];
      }).join(",");
      return `(${values})`
    }).join(",");

  const queryStr = `INSERT INTO ${tableName} (${columnNames}) VALUES (${allValues})`;

  return query<SqlSaveResponse>(queryStr);
};

export const queryToSaveManyToManyEntity = async (
  tableName: string,
  mainId: number,
  subId: number
): Promise<SqlSaveResponse> => {
  const queryStr: string =
    `INSERT INTO ${tableName} (` +
    DB_SAVE_LISTS_MAPPING[tableName].mainId +
    "," +
    DB_SAVE_LISTS_MAPPING[tableName].subId +
    `) VALUES (${mainId},${subId})`;

  return query<SqlSaveResponse>(queryStr);
};

export const queriesToSaveListOfEntities = async (
  tableName: string,
  mainId: number,
  subIds: number[]
): Promise<SqlSaveResponse[]> => {
  const queries: Promise<SqlSaveResponse>[] = [];
  subIds.forEach((subId) => {
    queries.push(queryToSaveManyToManyEntity(tableName, mainId, subId));
  });
  return Promise.all(queries);
};

export const queryToDeleteAnEntityById = async (
  tableName: string,
  id: number
): Promise<SqlSaveResponse> => {
  return query<SqlSaveResponse>(
    `DELETE FROM ${tableName} WHERE id=${id}`
  );
};

export const queryToDeleteAnEntityByAttribute = async (
  tableName: string,
  attributeName: string,
  attributeValue: string | number
): Promise<SqlSaveResponse> => {
  return query<SqlSaveResponse>(
    `DELETE FROM ${tableName} WHERE ${attributeName}="${attributeValue}"`
  );
};

export const queryToFindEntityByLibelle = async <T>(
  entityName: string,
  libelle: string
): Promise<T> => {
  libelle = prepareStringForSqlQuery(libelle);
  const results = await query<T[]>(
    `SELECT * FROM ${entityName} WHERE libelle="${libelle}"`
  );
  return getFirstResult<T>(results);
};

export const queryToFindEntityByCode = async <T>(
  entityName: string,
  code: string
): Promise<T> => {
  code = prepareStringForSqlQuery(code);
  const results = await query<T[]>(
    `SELECT * FROM ${entityName} WHERE code="${code}"`
  );
  return getFirstResult<T>(results);
};

export const queryToCheckIfTableExists = async (tableName: string): Promise<boolean> => {
  const queryStr = `SHOW TABLES LIKE '${tableName}'`;
  const results = await query<string[]>(queryStr);
  return results?.length === 1;
}

export const prepareStringForSqlQuery = (str: string): string => {
  return str.trim().replace(/"/g, '\\"');
}

export const getFirstResult = <T>(results: T[]): T | null => {
  return results && results[0] ? results[0] : null;
}