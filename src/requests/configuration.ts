import { Age } from "ouca-common/age.object";
import { AppConfiguration } from "ouca-common/app-configuration.object";
import { Departement } from "ouca-common/departement.object";
import { Observateur } from "ouca-common/observateur.object";
import { Sexe } from "ouca-common/sexe.object";
import { HttpParameters } from "../http/httpParameters";
import { buildEstimationsNombreFromEstimationsNombreDb } from "../mapping/estimation-nombre-mapping";
import {
  buildAppConfigurationFromSettingsDb,
  buildSettingsDbFromAppConfiguration
} from "../mapping/settings-mapping";
import { EstimationNombreDb } from "../objects/db/estimation-nombre-db.object";
import { SettingsDb } from "../objects/db/settings-db.object";
import { saveDbEntity } from "../sql-api/sql-api-common";
import {
  DB_CONFIGURATION_MAPPING,
  queryToFindAllEntities
} from "../sql/sql-queries-utils";
import {
  COLUMN_CODE,
  COLUMN_LIBELLE,
  ORDER_ASC,
  TABLE_AGE,
  TABLE_DEPARTEMENT,
  TABLE_ESTIMATION_NOMBRE,
  TABLE_OBSERVATEUR,
  TABLE_SETTINGS,
  TABLE_SEXE
} from "../utils/constants";
import { sendAppConfigurationToAll } from "../ws/ws-messages";

export const getAppConfiguration = async (): Promise<AppConfiguration> => {
  const [
    settingsDb,
    observateurs,
    departements,
    ages,
    sexes,
    estimationsNombreDb
  ] = await Promise.all([
    queryToFindAllEntities<SettingsDb>(TABLE_SETTINGS),
    queryToFindAllEntities<Observateur>(
      TABLE_OBSERVATEUR,
      COLUMN_LIBELLE,
      ORDER_ASC
    ),
    queryToFindAllEntities<Departement>(
      TABLE_DEPARTEMENT,
      COLUMN_CODE,
      ORDER_ASC
    ),
    queryToFindAllEntities<Age>(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC),
    queryToFindAllEntities<Sexe>(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC),
    queryToFindAllEntities<EstimationNombreDb>(
      TABLE_ESTIMATION_NOMBRE,
      COLUMN_LIBELLE,
      ORDER_ASC
    )
  ]);

  const settings: SettingsDb = settingsDb[0];
  const estimationsNombre = buildEstimationsNombreFromEstimationsNombreDb(
    estimationsNombreDb
  );

  return buildAppConfigurationFromSettingsDb(
    settings,
    observateurs,
    departements,
    ages,
    sexes,
    estimationsNombre
  );
};

export const configurationUpdate = async (
  httpParameters: HttpParameters
): Promise<boolean> => {
  const appConfiguration: AppConfiguration = httpParameters.postData;

  const settingsDb: SettingsDb = buildSettingsDbFromAppConfiguration(
    appConfiguration
  );

  const sqlSaveResponse = await saveDbEntity(
    settingsDb,
    TABLE_SETTINGS,
    DB_CONFIGURATION_MAPPING
  );

  const isDbUpdateOK = sqlSaveResponse.affectedRows === 1;

  // Notify the ws listeners of the new configuration
  if (isDbUpdateOK) {
    await sendAppConfigurationToAll();
  }

  return isDbUpdateOK;
};
