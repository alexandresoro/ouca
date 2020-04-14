import { AppConfiguration } from "ouca-common/app-configuration.object";
import { HttpParameters } from "../http/httpParameters";
import {
  buildAppConfigurationFromSettingsDb,
  buildSettingsDbFromAppConfiguration,
} from "../mapping/settings-mapping";
import { SettingsDb } from "../objects/db/settings-db.object";
import { saveDbEntity } from "../sql-api/sql-api-common";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  DB_CONFIGURATION_MAPPING,
  getFindAllQuery,
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
  TABLE_SEXE,
} from "../utils/constants";

export const getAppConfiguration = async (): Promise<AppConfiguration> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_SETTINGS) +
      getFindAllQuery(TABLE_OBSERVATEUR, COLUMN_LIBELLE, ORDER_ASC) +
      getFindAllQuery(TABLE_DEPARTEMENT, COLUMN_CODE, ORDER_ASC) +
      getFindAllQuery(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC) +
      getFindAllQuery(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC) +
      getFindAllQuery(TABLE_ESTIMATION_NOMBRE, COLUMN_LIBELLE, ORDER_ASC)
  );

  const settings: SettingsDb = results[0][0];
  const observateurs = results[1];
  const departements = results[2];
  const ages = results[3];
  const sexes = results[4];
  const estimationsNombre = results[5];

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

  return sqlSaveResponse.affectedRows === 1;
};
