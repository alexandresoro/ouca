import { EntiteSimple } from "../model/types/entite-simple.object";
import { EntityDb } from "../objects/db/entity-db.model";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToCreateAgeTable } from "../sql/sql-queries-age";
import { queryToCreateClasseTable } from "../sql/sql-queries-classe";
import { queriesToClearAllTables } from "../sql/sql-queries-common";
import { queryToCreateCommuneTable } from "../sql/sql-queries-commune";
import { queryToCreateComportementTable } from "../sql/sql-queries-comportement";
import { queryToCreateDepartementTable } from "../sql/sql-queries-departement";
import { queryToCreateDonneeComportementTable, queryToCreateDonneeMilieuTable, queryToCreateDonneeTable } from "../sql/sql-queries-donnee";
import { queryToCreateEspeceTable } from "../sql/sql-queries-espece";
import { queryToCreateEstimationDistanceTable } from "../sql/sql-queries-estimation-distance";
import { queryToCreateEstimationNombreTable } from "../sql/sql-queries-estimation-nombre";
import { queryToCreateInventaireAssocieTable, queryToCreateInventaireMeteoTable, queryToCreateInventaireTable } from "../sql/sql-queries-inventaire";
import { queryToCreateLieuDitTable } from "../sql/sql-queries-lieudit";
import { queryToCreateMeteoTable } from "../sql/sql-queries-meteo";
import { queryToCreateMilieuTable } from "../sql/sql-queries-milieu";
import { queryToCreateObservateurTable } from "../sql/sql-queries-observateur";
import { queryToCreateSettingsTable } from "../sql/sql-queries-settings";
import { queryToCreateSexeTable } from "../sql/sql-queries-sexe";
import { queryToDeleteAnEntityById, queryToFindAllEntities, queryToFindEntityByCode, queryToFindEntityByLibelle, queryToInsertMultipleEntities, queryToSaveEntity } from "../sql/sql-queries-utils";
import { queryToCreateVersionTable } from "../sql/sql-queries-version";
import { onTableUpdate } from "../ws/ws-messages";

export const createAndInitializeAllTables = async (): Promise<void> => {
  await queryToCreateObservateurTable();
  await queryToCreateDepartementTable();
  await queryToCreateCommuneTable();
  await queryToCreateLieuDitTable();
  await queryToCreateMeteoTable();
  await queryToCreateClasseTable();
  await queryToCreateEspeceTable();
  await queryToCreateAgeTable();
  await queryToCreateSexeTable();
  await queryToCreateEstimationNombreTable();
  await queryToCreateEstimationDistanceTable();
  await queryToCreateComportementTable();
  await queryToCreateMilieuTable();
  await queryToCreateInventaireTable();
  await queryToCreateInventaireAssocieTable();
  await queryToCreateInventaireMeteoTable();
  await queryToCreateDonneeTable();
  await queryToCreateDonneeComportementTable();
  await queryToCreateDonneeMilieuTable();
  await queryToCreateSettingsTable();
  await queryToCreateVersionTable();
}

export const findAllEntities = async <T extends EntiteSimple>(
  tableName: string
): Promise<T[]> => {
  return queryToFindAllEntities<T>(tableName);
};

export const findEntityByCode = async <T extends EntiteSimple>(
  code: string,
  tableName: string
): Promise<T> => {
  return queryToFindEntityByCode(tableName, code);
};

export const findEntityByLibelle = async <T extends EntiteSimple>(
  libelle: string,
  tableName: string
): Promise<T> => {
  return queryToFindEntityByLibelle<T>(tableName, libelle);
};

export const persistEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: EntiteSimple | T,
  mapping?: Map<string, string>
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToSaveEntity(tableName, entityToSave, mapping);

  onTableUpdate(tableName);

  return sqlResponse;
};

export const insertMultipleEntities = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
  mapping?: Map<string, string>
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToInsertMultipleEntities(tableName, entitiesToSave, mapping);

  return sqlResponse;
};

export const deleteEntityById = async (
  entityName: string,
  id: number
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToDeleteAnEntityById(entityName, id);

  onTableUpdate(entityName);

  return sqlResponse;
};

export const clearAllTables = async (): Promise<void> => {
  await queriesToClearAllTables();
}
