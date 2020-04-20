import * as _ from "lodash";
import { Commune } from "ouca-common/commune.model";
import {
  buildCommuneFromCommuneDb,
  buildCommunesFromCommunesDb
} from "../mapping/commune-mapping";
import { CommuneDb } from "../objects/db/commune-db.object";
import {
  queryToFindAllCommunes,
  queryToFindCommuneByDepartementIdAndCode,
  queryToFindCommuneByDepartementIdAndCodeAndNom,
  queryToFindCommuneByDepartementIdAndNom,
  queryToFindNumberOfDonneesByCommuneId,
  queryToFindNumberOfLieuxDitsByCommuneId
} from "../sql/sql-queries-commune";
import { getNbByEntityId } from "../utils/utils";

const getFirstCommune = (communesDb: CommuneDb[]): Commune => {
  let commune: Commune = null;
  if (communesDb && communesDb[0]?.id) {
    commune = buildCommuneFromCommuneDb(communesDb[0]);
  }
  return commune;
};

export const findAllCommunes = async (): Promise<Commune[]> => {
  const [
    communesDb,
    nbLieuxditsByCommune,
    nbDonneesByCommune
  ] = await Promise.all([
    queryToFindAllCommunes(),
    queryToFindNumberOfLieuxDitsByCommuneId(),
    queryToFindNumberOfDonneesByCommuneId()
  ]);

  const communes: Commune[] = buildCommunesFromCommunesDb(communesDb);

  _.forEach(communes, (commune: Commune) => {
    commune.nbLieuxdits = getNbByEntityId(commune, nbLieuxditsByCommune);
    commune.nbDonnees = getNbByEntityId(commune, nbDonneesByCommune);
  });

  return communes;
};

export const findCommuneByDepartementIdAndCodeAndNom = async (
  departementId: number,
  code: number,
  nom: string
): Promise<Commune> => {
  const communesDb = await queryToFindCommuneByDepartementIdAndCodeAndNom(
    departementId,
    code,
    nom
  );

  return getFirstCommune(communesDb);
};

export const findCommuneByDepartementIdAndCode = async (
  departementId: number,
  code: number
): Promise<Commune> => {
  const communesDb = await queryToFindCommuneByDepartementIdAndCode(
    departementId,
    code
  );

  return getFirstCommune(communesDb);
};

export const findCommuneByDepartementIdAndNom = async (
  departementId: number,
  nom: string
): Promise<Commune> => {
  const communesDb = await queryToFindCommuneByDepartementIdAndNom(
    departementId,
    nom
  );

  return getFirstCommune(communesDb);
};
