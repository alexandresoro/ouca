import { EntiteSimple } from "../model/types/entite-simple.object";
import { EntityDb } from "../objects/db/entity-db.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToDeleteAnEntityById, queryToFindAllEntities, queryToFindEntityByCode, queryToFindEntityByLibelle, queryToInsertMultipleEntities, queryToSaveEntity } from "../sql/sql-queries-utils";
import { onTableUpdate } from "../ws/ws-messages";

export const findAllEntities = async <T extends EntiteSimple>(
  tableName: string
): Promise<T[]> => {
  return queryToFindAllEntities<T>(tableName);
};

export const findEntityByCode = async <T extends EntiteSimple>(
  code: string,
  tableName: string
): Promise<T> => {
  return queryToFindEntityByCode(tableName, code);
};

export const findEntityByLibelle = async <T extends EntiteSimple>(
  libelle: string,
  tableName: string
): Promise<T> => {
  return queryToFindEntityByLibelle<T>(tableName, libelle);
};

export const persistEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: EntiteSimple | T,
  mapping?: Map<string, string>
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToSaveEntity(tableName, entityToSave, mapping);

  onTableUpdate(tableName);

  return sqlResponse;
};

export const insertMultipleEntities = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
  mapping?: Map<string, string>
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToInsertMultipleEntities(tableName, entitiesToSave, mapping);

  return sqlResponse;
};

export const deleteEntityById = async (
  entityName: string,
  id: number
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToDeleteAnEntityById(entityName, id);

  onTableUpdate(entityName);

  return sqlResponse;
};
