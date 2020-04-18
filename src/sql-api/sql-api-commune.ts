import * as _ from "lodash";
import { Commune } from "ouca-common/commune.model";
import {
  buildCommuneFromCommuneDb,
  buildCommunesFromCommunesDb
} from "../mapping/commune-mapping";
import {
  queryToFindAllCommunes,
  queryToFindCommuneByDepartementIdAndCode,
  queryToFindCommuneByDepartementIdAndCodeAndNom,
  queryToFindCommuneByDepartementIdAndNom,
  queryToFindNumberOfDonneesByCommuneId,
  queryToFindNumberOfLieuxDitsByCommuneId
} from "../sql/sql-queries-commune";
import { getNbByEntityId } from "../utils/utils";

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

export const getCommuneByDepartementIdAndCodeAndNom = async (
  departementId: number,
  code: number,
  nom: string
): Promise<Commune> => {
  const communesDb = await queryToFindCommuneByDepartementIdAndCodeAndNom(
    departementId,
    code,
    nom
  );
  let commune: Commune = null;

  if (communesDb && communesDb[0]?.id) {
    commune = buildCommuneFromCommuneDb(communesDb[0]);
  }

  return commune;
};

export const getCommuneByDepartementIdAndCode = async (
  departementId: number,
  code: number
): Promise<Commune> => {
  const communesDb = await queryToFindCommuneByDepartementIdAndCode(
    departementId,
    code
  );

  let commune: Commune = null;

  if (communesDb && communesDb[0]?.id) {
    commune = buildCommuneFromCommuneDb(communesDb[0]);
  }

  return commune;
};

export const getCommuneByDepartementIdAndNom = async (
  departementId: number,
  nom: string
): Promise<Commune> => {
  const communesDb = await queryToFindCommuneByDepartementIdAndNom(
    departementId,
    nom
  );

  let commune: Commune = null;

  if (communesDb && communesDb[0]?.id) {
    commune = buildCommuneFromCommuneDb(communesDb[0]);
  }

  return commune;
};
