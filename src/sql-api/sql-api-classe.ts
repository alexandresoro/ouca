import { Classe } from "basenaturaliste-model/classe.object";
import { TABLE_CLASSE } from "../utils/constants";
import { getEntityByLibelle } from "./sql-api-common";

export const getClasseByLibelle = async (libelle: string): Promise<Classe> => {
  return (await getEntityByLibelle(libelle, TABLE_CLASSE)) as Classe;
};
