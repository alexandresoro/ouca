import { EntiteSimple } from "basenaturaliste-model/entite-simple.object";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindConfigurationByLibelle } from "../sql/sql-queries-configuration";
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
  const saveResult: any = await SqlConnection.query(
    getSaveEntityQuery(tableName, entityToSave, mapping)
  );

  return !!saveResult && !!saveResult.insertId && saveResult.affectedRows === 1;
};

export const getEntityByLibelle = async (
  libelle: string,
  tableName: string
): Promise<EntiteSimple> => {
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
