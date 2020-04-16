import * as _ from "lodash";
import { Classe } from "../classe.object";

export const findClasseById = (classes: Classe[], id: number): Classe => {
  return _.find(classes, (classe) => {
    return id === classe.id;
  });
};
