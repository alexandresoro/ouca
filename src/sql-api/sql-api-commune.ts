import { buildCommuneFromCommuneDb, buildCommunesFromCommunesDb } from "../mapping/commune-mapping";
import { Commune } from "../model/types/commune.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllCommunes, queryToFindCommuneByDepartementIdAndCode, queryToFindCommuneByDepartementIdAndCodeAndNom, queryToFindCommuneByDepartementIdAndNom, queryToFindNumberOfDonneesByCommuneId, queryToFindNumberOfLieuxDitsByCommuneId } from "../sql/sql-queries-commune";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_COMMUNE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { insertMultipleEntities, persistEntity } from "./sql-api-common";


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

  communes.forEach((commune: Commune) => {
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
  const communeDb = await queryToFindCommuneByDepartementIdAndCodeAndNom(
    departementId,
    code,
    nom
  );

  return buildCommuneFromCommuneDb(communeDb);
};

export const findCommuneByDepartementIdAndCode = async (
  departementId: number,
  code: number
): Promise<Commune> => {
  const communeDb = await queryToFindCommuneByDepartementIdAndCode(
    departementId,
    code
  );

  return buildCommuneFromCommuneDb(communeDb);
};

export const findCommuneByDepartementIdAndNom = async (
  departementId: number,
  nom: string
): Promise<Commune> => {
  const communeDb = await queryToFindCommuneByDepartementIdAndNom(
    departementId,
    nom
  );

  return buildCommuneFromCommuneDb(communeDb);
};

export const persistCommune = async (
  commune: Commune
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_COMMUNE, commune, DB_SAVE_MAPPING.get("commune"));
};

export const insertCommunes = async (
  communes: Commune[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_COMMUNE, communes, DB_SAVE_MAPPING.get("commune"));
};
