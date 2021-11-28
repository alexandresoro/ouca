import { EntiteSimple } from "../../model/types/entite-simple.object";
import { EntityDb } from "../../objects/db/entity-db.model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { queryToInsertMultipleEntities, queryToInsertMultipleEntitiesAndReturnIdsNoCheck, queryToInsertMultipleEntitiesNoCheck } from "../../sql/sql-queries-utils";

export const insertMultipleEntities = async <T extends EntityDb & { [key: string]: unknown }>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
  mapping: Record<string, string>,
): Promise<SqlSaveResponse> => {

  const sqlResponse = await queryToInsertMultipleEntities(tableName, entitiesToSave, mapping);
  return sqlResponse;

};

export const insertMultipleEntitiesNoCheck = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
): Promise<SqlSaveResponse> => {

  const sqlResponse = await queryToInsertMultipleEntitiesNoCheck(tableName, entitiesToSave);
  return sqlResponse;

};

export const insertMultipleEntitiesAndReturnIdsNoCheck = async <T extends Omit<EntityDb, "id">>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
): Promise<{ id: number }[]> => {

  const insertedIds = await queryToInsertMultipleEntitiesAndReturnIdsNoCheck(tableName, entitiesToSave);
  return insertedIds;

};
