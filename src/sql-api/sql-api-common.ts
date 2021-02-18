import { EntiteSimple } from "@ou-ca/ouca-model";
import { EntityDb } from "../objects/db/entity-db.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToDeleteAnEntityById, queryToFindAllEntities, queryToFindEntityByCode, queryToFindEntityByLibelle, queryToSaveEntity } from "../sql/sql-queries-utils";
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
  const entities = await queryToFindEntityByCode(tableName, code);

  if (entities && entities[0]?.id) {
    return entities[0];
  }

  return null;
};

export const findEntityByLibelle = async <T extends EntiteSimple>(
  libelle: string,
  tableName: string
): Promise<T> => {
  const entities = await queryToFindEntityByLibelle<T>(tableName, libelle);

  if (entities && entities[0]?.id) {
    return entities[0];
  }

  return null;
};

export const persistEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: EntiteSimple | T,
  mapping?: { [column: string]: string }
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToSaveEntity(tableName, entityToSave, mapping);

  onTableUpdate(tableName);

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
