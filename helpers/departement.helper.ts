import { DepartementWithCounts } from "../graphql";

export const findDepartementById = (
  departements: DepartementWithCounts[],
  id: number
): DepartementWithCounts => {
  return departements.find((departement) => {
    return id === departement.id;
  });
};
