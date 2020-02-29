import { Classe } from "ouca-common/classe.object";
import { TABLE_CLASSE } from "../utils/constants";
import { getEntityByLibelle } from "./sql-api-common";

export const getClasseByLibelle = async (libelle: string): Promise<Classe> => {
  return await getEntityByLibelle<Classe>(libelle, TABLE_CLASSE);
};
