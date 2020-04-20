import * as _ from "lodash";
import { Espece } from "ouca-common/espece.model";
import {
  buildEspeceFromEspeceDb,
  buildEspecesFromEspecesDb
} from "../mapping/espece-mapping";
import { EspeceDb } from "../objects/db/espece-db.object";
import {
  queryToFindAllEspeces,
  queryToFindEspeceByCode,
  queryToFindEspeceByNomFrancais,
  queryToFindEspeceByNomLatin,
  queryToFindNumberOfDonneesByEspeceId
} from "../sql/sql-queries-espece";
import { getNbByEntityId } from "../utils/utils";

const getFirstEspece = (especesDb: EspeceDb[]): Espece => {
  let espece: Espece = null;
  if (especesDb && especesDb[0]?.id) {
    espece = buildEspeceFromEspeceDb(especesDb[0]);
  }
  return espece;
};

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
  return getFirstEspece(especesDb);
};

export const findEspeceByNomFrancais = async (
  nomFrancais: string
): Promise<Espece> => {
  const especesDb = await queryToFindEspeceByNomFrancais(nomFrancais);
  return getFirstEspece(especesDb);
};

export const findEspeceByNomLatin = async (
  nomLatin: string
): Promise<Espece> => {
  const especesDb = await queryToFindEspeceByNomLatin(nomLatin);
  return getFirstEspece(especesDb);
};
