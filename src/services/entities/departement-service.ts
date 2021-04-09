import { Departement } from "../../model/types/departement.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { queryToFindAllDepartements, queryToFindDepartementByCode, queryToFindNumberOfCommunesByDepartementId, queryToFindNumberOfDonneesByDepartementId, queryToFindNumberOfLieuxDitsByDepartementId } from "../../sql/sql-queries-departement";
import { createKeyValueMapWithSameName } from "../../sql/sql-queries-utils";
import { TABLE_DEPARTEMENT } from "../../utils/constants";
import { getNbByEntityId } from "../../utils/utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_DEPARTEMENT = createKeyValueMapWithSameName("code");

export const findAllDepartements = async (): Promise<Departement[]> => {
  const [
    departements,
    nbCommunesByDepartement,
    nbLieuxditsByDepartement,
    nbDonneesByDepartement
  ] = await Promise.all([
    queryToFindAllDepartements(),
    queryToFindNumberOfCommunesByDepartementId(),
    queryToFindNumberOfLieuxDitsByDepartementId(),
    queryToFindNumberOfDonneesByDepartementId()
  ]);

  departements.forEach((departement: Departement) => {
    departement.nbCommunes = getNbByEntityId(
      departement,
      nbCommunesByDepartement
    );
    departement.nbLieuxdits = getNbByEntityId(
      departement,
      nbLieuxditsByDepartement
    );
    departement.nbDonnees = getNbByEntityId(
      departement,
      nbDonneesByDepartement
    );
  });

  return departements;
};

export const getDepartementByCode = async (
  code: string
): Promise<Departement> => {
  return queryToFindDepartementByCode(code);
};

export const persistDepartement = async (
  departement: Departement
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_DEPARTEMENT,
    departement,
    DB_SAVE_MAPPING_DEPARTEMENT
  );
};

export const insertDepartements = async (
  departements: Departement[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_DEPARTEMENT, departements, DB_SAVE_MAPPING_DEPARTEMENT);
};