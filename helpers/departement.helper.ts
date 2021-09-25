export const findDepartementById = <T extends { id: number }>(
  departements: T[],
  id: number
): T => {
  return departements.find((departement) => {
    return id === departement.id;
  });
};
