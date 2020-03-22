import { EntiteSimple } from "ouca-common/entite-simple.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getQueryToFindEntityByCode,
  getQueryToFindEntityByCodeAndLibelle,
  getQueryToFindEntityByLibelle,
  getSaveEntityQuery
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
  const results = await SqlConnection.query(
    getQueryToFindEntityByLibelle(tableName, libelle)
  );

  if (results && results[0] && results[0].id) {
    return results[0];
  }

  return null;
};

export const getEntityByCode = async (
  code: string,
  tableName: string
): Promise<EntiteSimple> => {
  const results = await SqlConnection.query(
    getQueryToFindEntityByCode(tableName, code)
  );

  if (results && results[0] && results[0].id) {
    return results[0];
  }

  return null;
};

export const getEntityByCodeAndLibelle = async (
  code: string,
  libelle: string,
  tableName: string
): Promise<EntiteSimple> => {
  const results = await SqlConnection.query(
    getQueryToFindEntityByCodeAndLibelle(tableName, code, libelle)
  );

  if (results && results[0] && results[0].id) {
    return results[0];
  }

  return null;
};
