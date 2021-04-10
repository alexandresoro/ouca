import { EntityDb } from "../objects/db/entity-db.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  DONNEE_ID,
  INVENTAIRE_ID,
  METEO_ID,
  OBSERVATEUR_ID
} from "../utils/constants";
import { SqlConnection } from "./sql-connection";


export const createKeyValueMapWithSameName = (
  names: string | string[]
): Record<string, string> => {
  return Object.fromEntries(([] as string[]).concat(names).map(name => [name, name]));
};


const mappingTables = ["inventaire_associe", "inventaire_meteo", "donnee_comportement", "donnee_milieu"] as const;

type MappingTable = typeof mappingTables[number];

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
} as const;

export function query<T>(query: string): Promise<T> {
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

const getCorrespondingDbValue = (value: unknown): string => {
  // Set the proper value in DB format
  let valueDb: string;
  if (value == null) {
    valueDb = "null";
  } else if (typeof value === 'boolean') {
    valueDb = (value ? "TRUE" : "FALSE");
  } else if (typeof value === 'string') {

    valueDb = '"' + prepareStringForSqlQuery(value) + '"';
  } else {
    valueDb = '"' + value.toString() + '"';
  }
  return valueDb;
}

// Method that processes an entity to be saved, in order to be used directly in the SQL query
// It basically takes the list of atributes that can exist for this entity from the mapping,
// and look for the corresponding DB name and value in the object T
// and return and array of elements, each element being an array of size 2, the db column name and the value to be set
// e.g. for an object {"id": 1, "toto": "titi", "tutu": 6} it will return
// [["toto", "titi"], ["tutu", "6"]]
const processEntityToSave = <T extends EntityDb>(
  entityToSave: T,
  mapping: Record<string, string>
): string[][] => {
  return Object.entries(mapping)
    .map(([dbKey, mappingKey]) => {
      const entityValue: unknown = entityToSave[mappingKey];
      const valueDb = getCorrespondingDbValue(entityValue);
      return [dbKey, valueDb];
    });

}

const processEntityToSaveNoCheck = <T extends Omit<EntityDb, "id">>(
  entityToSave: T,
): string[][] => {
  return Object.entries(entityToSave).map(([key, value]) => {
    const valueDb = getCorrespondingDbValue(value);
    return [key, valueDb];
  });

}

const queryToSaveEntityCommon = <T extends EntityDb>(tableName: string,
  entityToSave: T,
  dbEntityToSaveAsArray: string[][]): Promise<SqlSaveResponse> => {
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
    const updates = dbEntityToSaveAsArray.filter(([key]) => {
      return key !== "id";
    }).map((elt) => {
      return `${elt[0]}=${elt[1]}`;
    }).join(",");

    queryStr = `UPDATE ${tableName} SET ${updates} WHERE id=${entityToSave.id}`;
  }

  return query<SqlSaveResponse>(queryStr);
}

export const queryToSaveEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: T,
  mapping: Record<string, string>
): Promise<SqlSaveResponse> => {
  const dbEntityToSaveAsArray = processEntityToSave(entityToSave, mapping);
  return queryToSaveEntityCommon(tableName, entityToSave, dbEntityToSaveAsArray);
};

export const queryToSaveEntityNoCheck = async <T extends EntityDb>(
  tableName: string,
  entityToSave: T,
): Promise<SqlSaveResponse> => {
  const dbEntityToSaveAsArray = processEntityToSaveNoCheck(entityToSave);
  return queryToSaveEntityCommon(tableName, entityToSave, dbEntityToSaveAsArray);
};

const getColumnNamesAndInsertionValuesFromEntitiesCommon = (dbEntitiesToSaveAsArray: string[][][]): { columnNames: string, allValues: string } => {
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

  return {
    columnNames,
    allValues
  }
}

const getColumnNamesAndInsertionValuesFromEntities = <T extends EntityDb>(entitiesToSave: T[], mapping: Record<string, string>
): { columnNames: string, allValues: string } => {
  const dbEntitiesToSaveAsArray = entitiesToSave.map(entity => processEntityToSave(entity, mapping));
  return getColumnNamesAndInsertionValuesFromEntitiesCommon(dbEntitiesToSaveAsArray);
}

const getColumnNamesAndInsertionValuesFromEntitiesNoCheck = <T extends Omit<EntityDb, "id">>(entitiesToSave: T[]): { columnNames: string, allValues: string } => {
  const dbEntitiesToSaveAsArray = entitiesToSave.map(entity => processEntityToSaveNoCheck(entity));
  return getColumnNamesAndInsertionValuesFromEntitiesCommon(dbEntitiesToSaveAsArray);
}

const queryToInsertMultipleEntitiesCommon = async (
  columnNamesAndValues: { columnNames: string, allValues: string },
  tableName: string
): Promise<SqlSaveResponse> => {
  const queryStr = `INSERT INTO ${tableName} (${columnNamesAndValues.columnNames}) VALUES ${columnNamesAndValues.allValues}`;
  return query<SqlSaveResponse>(queryStr);
};

export const queryToInsertMultipleEntities = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: T[],
  mapping: Record<string, string>
): Promise<SqlSaveResponse> => {
  const columnNamesAndValues = getColumnNamesAndInsertionValuesFromEntities(entitiesToSave, mapping);
  return queryToInsertMultipleEntitiesCommon(columnNamesAndValues, tableName);
};

export const queryToInsertMultipleEntitiesNoCheck = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: T[]
): Promise<SqlSaveResponse> => {
  const columnNamesAndValues = getColumnNamesAndInsertionValuesFromEntitiesNoCheck(entitiesToSave);
  return queryToInsertMultipleEntitiesCommon(columnNamesAndValues, tableName);
};

const queryToInsertMultipleEntitiesAndReturnIdsCommon = async (
  columnNamesAndValues: { columnNames: string, allValues: string },
  tableName: string
): Promise<{ id: number }[]> => {
  const queryStr = `INSERT INTO ${tableName} (${columnNamesAndValues.columnNames}) VALUES ${columnNamesAndValues.allValues} RETURNING id`;
  return query<{ id: number }[]>(queryStr);
}

export const queryToInsertMultipleEntitiesAndReturnIdsNoCheck = async <T extends Omit<EntityDb, "id">>(
  tableName: string,
  entitiesToSave: T[],
): Promise<{ id: number }[]> => {
  const columnNamesAndValues = getColumnNamesAndInsertionValuesFromEntitiesNoCheck(entitiesToSave);
  return queryToInsertMultipleEntitiesAndReturnIdsCommon(columnNamesAndValues, tableName);
};

export const queryToSaveListOfEntities = async (
  tableName: MappingTable,
  mainAndSubIds: [number, number[]][]
): Promise<SqlSaveResponse> => {
  const columnNames = `${DB_SAVE_LISTS_MAPPING[tableName].mainId},${DB_SAVE_LISTS_MAPPING[tableName].subId}`


  const allValues = mainAndSubIds.map((oneMainAndSubIds) => {
    const mainId = oneMainAndSubIds[0];
    return oneMainAndSubIds[1].map((subId) => {
      return `(${mainId},${subId})`;
    }).join(",");
  }).join(",");

  const queryStr = `INSERT INTO ${tableName} (${columnNames}) VALUES ${allValues}`;
  return query<SqlSaveResponse>(queryStr);
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