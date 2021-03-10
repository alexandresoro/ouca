import { Departement } from "../model/types/departement.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllDepartements, queryToFindDepartementByCode, queryToFindNumberOfCommunesByDepartementId, queryToFindNumberOfDonneesByDepartementId, queryToFindNumberOfLieuxDitsByDepartementId } from "../sql/sql-queries-departement";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_DEPARTEMENT } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

const getFirstDepartement = (departements: Departement[]): Departement => {
  let departement: Departement = null;
  if (departements && departements[0]?.id) {
    departement = departements[0];
  }
  return departement;
};

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
  const departements = await queryToFindDepartementByCode(code);

  return getFirstDepartement(departements);
};

export const persistDepartement = async (
  departement: Departement
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_DEPARTEMENT,
    departement,
    DB_SAVE_MAPPING.get("departement")
  );
};
