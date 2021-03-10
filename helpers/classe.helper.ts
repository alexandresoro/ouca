import { Classe } from "../types/classe.object";

export const findClasseById = (classes: Classe[], id: number): Classe => {
  return classes.find((classe) => {
    return id === classe.id;
  });
};
