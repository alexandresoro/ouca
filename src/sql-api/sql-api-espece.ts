import { Espece } from "ouca-common/espece.object";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getQueryToFindEspeceByCode,
  getQueryToFindEspeceByNomFrancais,
  getQueryToFindEspeceByNomLatin
} from "../sql/sql-queries-espece";
import { mapEspece } from "../utils/mapping-utils";

export const findEspeceByCode = async (code: string): Promise<Espece> => {
  const results = await SqlConnection.query(getQueryToFindEspeceByCode(code));

  if (results && results[0] && results[0].id) {
    return mapEspece(results[0]);
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
    return mapEspece(results[0]);
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
    return mapEspece(results[0]);
  }

  return null;
};
