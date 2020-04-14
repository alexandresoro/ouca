import { Espece } from "ouca-common/espece.object";
import { buildEspeceFromEspeceDb } from "../mapping/espece-mapping";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getQueryToFindEspeceByCode,
  getQueryToFindEspeceByNomFrancais,
  getQueryToFindEspeceByNomLatin
} from "../sql/sql-queries-espece";

export const findEspeceByCode = async (code: string): Promise<Espece> => {
  const results = await SqlConnection.query(getQueryToFindEspeceByCode(code));

  if (results && results[0] && results[0].id) {
    return buildEspeceFromEspeceDb(results[0]);
  }

  return null;
};

export const getEspeceByNomFrancais = async (
  nomFrancais: string
): Promise<Espece> => {
  const results = await SqlConnection.query(
    getQueryToFindEspeceByNomFrancais(nomFrancais)
  );

  if (results && results[0] && results[0].id) {
    return buildEspeceFromEspeceDb(results[0]);
  }

  return null;
};

export const getEspeceByNomLatin = async (
  nomLatin: string
): Promise<Espece> => {
  const results = await SqlConnection.query(
    getQueryToFindEspeceByNomLatin(nomLatin)
  );

  if (results && results[0] && results[0].id) {
    return buildEspeceFromEspeceDb(results[0]);
  }

  return null;
};
