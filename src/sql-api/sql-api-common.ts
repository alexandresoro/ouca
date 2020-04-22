import { EntiteSimple } from "ouca-common/entite-simple.object";
import { EntityDb } from "../objects/db/entity-db.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  queryToDeleteAnEntityById,
  queryToFindEntityByCode,
  queryToFindEntityByCodeAndLibelle,
  queryToFindEntityByLibelle,
  queryToSaveEntity
} from "../sql/sql-queries-utils";
import { onTableUpdate } from "../ws/ws-messages";

export const persistEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: EntiteSimple | T,
  mapping?: { [column: string]: string }
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToSaveEntity(tableName, entityToSave, mapping);

  onTableUpdate(tableName);
  return sqlResponse;
};

// TODO use the same method for gestion and import
export const saveEntity = async (
  tableName: string,
  entityToSave: EntiteSimple,
  mapping: { [column: string]: string }
): Promise<boolean> => {
  const saveResult = await persistEntity(tableName, entityToSave, mapping);
  return !!saveResult && !!saveResult.insertId && saveResult.affectedRows === 1;
};

export const saveDbEntity = async (
  entityToSave: EntiteSimple,
  tableName: string
): Promise<SqlSaveResponse> => {
  return await persistEntity(tableName, entityToSave);
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

export const findEntityByCode = async (
  code: string,
  tableName: string
): Promise<EntiteSimple> => {
  const entities = await queryToFindEntityByCode(tableName, code);

  if (entities && entities[0]?.id) {
    return entities[0];
  }

  return null;
};

export const findEntityByCodeAndLibelle = async (
  code: string,
  libelle: string,
  tableName: string
): Promise<EntiteSimple> => {
  const entities = await queryToFindEntityByCodeAndLibelle(
    tableName,
    code,
    libelle
  );

  if (entities && entities[0]?.id) {
    return entities[0];
  }

  return null;
};

export const deleteEntityById = async (
  entityName: string,
  id: number
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToDeleteAnEntityById(entityName, id);

  onTableUpdate(entityName);

  return sqlResponse;
};
