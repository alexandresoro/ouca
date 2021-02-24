import { Classe } from "@ou-ca/ouca-model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllClasses, queryToFindNumberOfDonneesByClasseId, queryToFindNumberOfEspecesByClasseId } from "../sql/sql-queries-classe";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_CLASSE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { findEntityByLibelle, persistEntity } from "./sql-api-common";

export const findAllClasses = async (): Promise<Classe[]> => {
  const [classes, nbEspecesByClasse, nbDonneesByClasse] = await Promise.all([
    queryToFindAllClasses(),
    queryToFindNumberOfEspecesByClasseId(),
    queryToFindNumberOfDonneesByClasseId()
  ]);

  classes.forEach((classe: Classe) => {
    classe.nbEspeces = getNbByEntityId(classe, nbEspecesByClasse);
    classe.nbDonnees = getNbByEntityId(classe, nbDonneesByClasse);
  });

  return classes;
};

export const findClasseByLibelle = async (libelle: string): Promise<Classe> => {
  return await findEntityByLibelle<Classe>(libelle, TABLE_CLASSE);
};

export const persistClasse = async (
  classe: Classe
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_CLASSE, classe, DB_SAVE_MAPPING.get("classe"));
};
