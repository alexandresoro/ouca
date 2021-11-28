import { Prisma } from "@prisma/client";
import { EntityDb } from "../objects/db/entity-db.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  DONNEE_ID,
  INVENTAIRE_ID,
  METEO_ID,
  OBSERVATEUR_ID
} from "../utils/constants";
import { SqlConnection } from "./sql-connection";

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

export const queryParametersToFindAllEntities = (attributeForOrdering?: string, order?: Prisma.SortOrder): { orderBy?: Record<string, Prisma.SortOrder> } => {
  if (attributeForOrdering) {
    return {
      orderBy: {
        [attributeForOrdering]: order ?? Prisma.SortOrder.asc
      }
    }
  }
  return {};
}

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

const processEntityToSaveNoCheck = <T extends Omit<EntityDb, "id">>(
  entityToSave: T,
): string[][] => {
  return Object.entries(entityToSave).map(([key, value]) => {
    const valueDb = getCorrespondingDbValue(value);
    return [key, valueDb];
  });

}

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

export const prepareStringForSqlQuery = (str: string): string => {
  return str.trim().replace(/"/g, '\\"');
}
