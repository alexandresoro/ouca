import { Classe } from "../../model/types/classe.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { queryToFindAllClasses, queryToFindNumberOfDonneesByClasseId, queryToFindNumberOfEspecesByClasseId } from "../../sql/sql-queries-classe";
import { createKeyValueMapWithSameName } from "../../sql/sql-queries-utils";
import { TABLE_CLASSE } from "../../utils/constants";
import { getNbByEntityId } from "../../utils/utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";


const DB_SAVE_MAPPING_CLASSE = createKeyValueMapWithSameName("libelle");

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

export const persistClasse = async (
  classe: Classe
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_CLASSE, classe, DB_SAVE_MAPPING_CLASSE);
};

export const insertClasses = async (
  classes: Classe[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_CLASSE, classes, DB_SAVE_MAPPING_CLASSE);
};