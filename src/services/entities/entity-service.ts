import { EntiteSimple } from "../../model/types/entite-simple.object";
import { EntityDb } from "../../objects/db/entity-db.model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { queryToCreateAgeTable } from "../../sql/sql-queries-age";
import { queryToCreateClasseTable } from "../../sql/sql-queries-classe";
import { queriesToClearAllTables } from "../../sql/sql-queries-common";
import { queryToCreateCommuneTable } from "../../sql/sql-queries-commune";
import { queryToCreateComportementTable } from "../../sql/sql-queries-comportement";
import { queryToCreateDepartementTable } from "../../sql/sql-queries-departement";
import { queryToCreateDonneeComportementTable, queryToCreateDonneeMilieuTable, queryToCreateDonneeTable } from "../../sql/sql-queries-donnee";
import { queryToCreateEspeceTable } from "../../sql/sql-queries-espece";
import { queryToCreateEstimationDistanceTable } from "../../sql/sql-queries-estimation-distance";
import { queryToCreateEstimationNombreTable } from "../../sql/sql-queries-estimation-nombre";
import { queryToCreateInventaireAssocieTable, queryToCreateInventaireMeteoTable, queryToCreateInventaireTable } from "../../sql/sql-queries-inventaire";
import { queryToCreateLieuDitTable } from "../../sql/sql-queries-lieudit";
import { queryToCreateMeteoTable } from "../../sql/sql-queries-meteo";
import { queryToCreateMilieuTable } from "../../sql/sql-queries-milieu";
import { queryToCreateObservateurTable } from "../../sql/sql-queries-observateur";
import { queryToCreateSettingsTable } from "../../sql/sql-queries-settings";
import { queryToCreateSexeTable } from "../../sql/sql-queries-sexe";
import { queryToDeleteAnEntityById, queryToFindAllEntities, queryToInsertMultipleEntities, queryToInsertMultipleEntitiesAndReturnIdsNoCheck, queryToInsertMultipleEntitiesNoCheck, queryToSaveEntity, queryToSaveEntityNoCheck } from "../../sql/sql-queries-utils";
import { queryToCreateVersionTable } from "../../sql/sql-queries-version";

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

export const persistEntity = async <T extends EntityDb>(
  tableName: string,
  entityToSave: EntiteSimple | T,
  mapping: Record<string, string>
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToSaveEntity(tableName, entityToSave, mapping);

  return sqlResponse;
};

export const persistEntityNoCheck = async <T extends EntityDb>(
  tableName: string,
  entityToSave: T,
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToSaveEntityNoCheck(tableName, entityToSave);

  return sqlResponse;
};

export const insertMultipleEntities = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
  mapping: Record<string, string>,
): Promise<SqlSaveResponse> => {

  const sqlResponse = await queryToInsertMultipleEntities(tableName, entitiesToSave, mapping);
  return sqlResponse;

};

export const insertMultipleEntitiesNoCheck = async <T extends EntityDb>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
): Promise<SqlSaveResponse> => {

  const sqlResponse = await queryToInsertMultipleEntitiesNoCheck(tableName, entitiesToSave);
  return sqlResponse;

};

export const insertMultipleEntitiesAndReturnIdsNoCheck = async <T extends Omit<EntityDb, "id">>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
): Promise<{ id: number }[]> => {

  const insertedIds = await queryToInsertMultipleEntitiesAndReturnIdsNoCheck(tableName, entitiesToSave);
  return insertedIds;

};

export const deleteEntityById = async (
  entityName: string,
  id: number
): Promise<SqlSaveResponse> => {
  const sqlResponse = await queryToDeleteAnEntityById(entityName, id);

  return sqlResponse;
};

export const clearAllTables = async (): Promise<void> => {
  await queriesToClearAllTables();
}
