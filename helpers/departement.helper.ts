import { Departement } from "../graphql";

export const findDepartementById = (
  departements: Departement[],
  id: number
): Departement => {
  return departements.find((departement) => {
    return id === departement.id;
  });
};
