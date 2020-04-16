import * as _ from "lodash";
import { Departement } from "../departement.object";

export const findDepartementById = (
  departements: Departement[],
  id: number
): Departement => {
  return _.find(departements, (departement) => {
    return id === departement.id;
  });
};
