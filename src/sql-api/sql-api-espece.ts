import * as _ from "lodash";
import { Espece } from "ouca-common/espece.model";
import {
  buildEspeceFromEspeceDb,
  buildEspecesFromEspecesDb
} from "../mapping/espece-mapping";
import {
  queryToFindAllEspeces,
  queryToFindEspeceByCode,
  queryToFindEspeceByNomFrancais,
  queryToFindEspeceByNomLatin,
  queryToFindNumberOfDonneesByEspeceId
} from "../sql/sql-queries-espece";
import { getNbByEntityId } from "../utils/utils";

export const findAllEspeces = async (): Promise<Espece[]> => {
  const [especesDb, nbDonneesByEspece] = await Promise.all([
    queryToFindAllEspeces(),
    queryToFindNumberOfDonneesByEspeceId()
  ]);

  const especes: Espece[] = buildEspecesFromEspecesDb(especesDb);
  _.forEach(especes, (espece: Espece) => {
    espece.nbDonnees = getNbByEntityId(espece, nbDonneesByEspece);
  });

  return especes;
};

export const findEspeceByCode = async (code: string): Promise<Espece> => {
  const especesDb = await queryToFindEspeceByCode(code);

  if (especesDb && especesDb[0]?.id) {
    return buildEspeceFromEspeceDb(especesDb[0]);
  }

  return null;
};

export const findEspeceByNomFrancais = async (
  nomFrancais: string
): Promise<Espece> => {
  const especesDb = await queryToFindEspeceByNomFrancais(nomFrancais);

  if (especesDb && especesDb[0]?.id) {
    return buildEspeceFromEspeceDb(especesDb[0]);
  }

  return null;
};

export const findEspeceByNomLatin = async (
  nomLatin: string
): Promise<Espece> => {
  const especesDb = await queryToFindEspeceByNomLatin(nomLatin);

  if (especesDb && especesDb[0]?.id) {
    return buildEspeceFromEspeceDb(especesDb[0]);
  }

  return null;
};
