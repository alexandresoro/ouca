import * as _ from "lodash";
import { Departement } from "ouca-common/departement.object";
import {
  queryToFindAllDepartements,
  queryToFindDepartementByCode,
  queryToFindNumberOfCommunesByDepartementId,
  queryToFindNumberOfDonneesByDepartementId,
  queryToFindNumberOfLieuxDitsByDepartementId
} from "../sql/sql-queries-departement";
import { getNbByEntityId } from "../utils/utils";

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

  _.forEach(departements, (departement: Departement) => {
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
