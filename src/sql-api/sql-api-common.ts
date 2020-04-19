import { EntiteSimple } from "ouca-common/entite-simple.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getSaveEntityQuery,
  queryToDeleteAnEntityById,
  queryToFindEntityByCode,
  queryToFindEntityByCodeAndLibelle,
  queryToFindEntityByLibelle
} from "../sql/sql-queries-utils";

export const saveEntity = async (
  tableName: string,
  entityToSave: EntiteSimple,
  mapping: { [column: string]: string }
): Promise<boolean> => {
  const saveResult: SqlSaveResponse = await SqlConnection.query(
    getSaveEntityQuery(tableName, entityToSave, mapping)
  );

  return !!saveResult && !!saveResult.insertId && saveResult.affectedRows === 1;
};

export const saveDbEntity = async (
  entityToSave: EntiteSimple,
  tableName: string,
  mapping: { [column: string]: string }
): Promise<SqlSaveResponse> => {
  return await SqlConnection.query(
    getSaveEntityQuery(tableName, entityToSave, mapping)
  );
};

export const getEntityByLibelle = async <T extends EntiteSimple>(
  libelle: string,
  tableName: string
): Promise<T> => {
  const entities = await queryToFindEntityByLibelle<T>(tableName, libelle);

  if (entities && entities[0]?.id) {
    return entities[0];
  }

  return null;
};

export const getEntityByCode = async (
  code: string,
  tableName: string
): Promise<EntiteSimple> => {
  const entities = await queryToFindEntityByCode(tableName, code);

  if (entities && entities[0]?.id) {
    return entities[0];
  }

  return null;
};

export const getEntityByCodeAndLibelle = async (
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
  return await queryToDeleteAnEntityById(entityName, id);
};
