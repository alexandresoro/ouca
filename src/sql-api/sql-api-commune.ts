import { Commune } from "basenaturaliste-model/commune.object";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getQueryToFindCommuneByDepartementIdAndCode,
  getQueryToFindCommuneByDepartementIdAndCodeAndNom,
  getQueryToFindCommuneByDepartementIdAndNom
} from "../sql/sql-queries-commune";
import { mapCommune } from "../utils/mapping-utils";

export const getCommuneByDepartementIdAndCodeAndNom = async (
  departementId: number,
  code: number,
  nom: string
): Promise<Commune> => {
  const results = await SqlConnection.query(
    getQueryToFindCommuneByDepartementIdAndCodeAndNom(departementId, code, nom)
  );

  let commune: Commune = null;

  if (results && results[0] && results[0].id) {
    commune = mapCommune(results[0]);
  }

  return commune;
};

export const getCommuneByDepartementIdAndCode = async (
  departementId: number,
  code: number
): Promise<Commune> => {
  const results = await SqlConnection.query(
    getQueryToFindCommuneByDepartementIdAndCode(departementId, code)
  );

  let commune: Commune = null;

  if (results && results[0] && results[0].id) {
    commune = mapCommune(results[0]);
  }

  return commune;
};

export const getCommuneByDepartementIdAndNom = async (
  departementId: number,
  nom: string
): Promise<Commune> => {
  const results = await SqlConnection.query(
    getQueryToFindCommuneByDepartementIdAndNom(departementId, nom)
  );

  let commune: Commune = null;

  if (results && results[0] && results[0].id) {
    commune = mapCommune(results[0]);
  }

  return commune;
};
