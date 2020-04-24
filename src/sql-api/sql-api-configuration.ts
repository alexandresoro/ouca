import { Age } from "ouca-common/age.object";
import { AppConfiguration } from "ouca-common/app-configuration.object";
import { CoordinatesSystemType } from "ouca-common/coordinates-system";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { Observateur } from "ouca-common/observateur.object";
import { Sexe } from "ouca-common/sexe.object";
import {
  buildAppConfigurationFromSettingsDb,
  buildSettingsDbFromAppConfiguration
} from "../mapping/settings-mapping";
import { SettingsDb } from "../objects/db/settings-db.object";
import { queryToFindCoordinatesSystem } from "../sql/sql-queries-settings";
import { queryToFindAllEntities } from "../sql/sql-queries-utils";
import { TABLE_SETTINGS } from "../utils/constants";
import { findAllAges } from "./sql-api-age";
import { persistEntity } from "./sql-api-common";
import { findAllDepartements } from "./sql-api-departement";
import { findAllEstimationsNombre } from "./sql-api-estimation-nombre";
import { findAllObservateurs } from "./sql-api-observateur";
import { findAllSexes } from "./sql-api-sexe";

const findUserSettings = async (): Promise<SettingsDb> => {
  const settingsDb = await queryToFindAllEntities<SettingsDb>(TABLE_SETTINGS);
  return settingsDb && settingsDb[0] ? settingsDb[0] : null;
};

export const findAppConfiguration = async (): Promise<AppConfiguration> => {
  const [
    settings,
    observateurs,
    departements,
    ages,
    sexes,
    estimationsNombre
  ] = await Promise.all([
    findUserSettings(),
    findAllObservateurs(),
    findAllDepartements(),
    findAllAges(),
    findAllSexes(),
    findAllEstimationsNombre()
  ]);

  return buildAppConfigurationFromSettingsDb(
    settings,
    observateurs as Observateur[],
    departements,
    ages as Age[],
    sexes as Sexe[],
    estimationsNombre as EstimationNombre[]
  );
};

export const persistUserSettings = async (
  appConfiguration: AppConfiguration
): Promise<boolean> => {
  const settingsDb: SettingsDb = buildSettingsDbFromAppConfiguration(
    appConfiguration
  );

  const sqlSaveResponse = await persistEntity(TABLE_SETTINGS, settingsDb);

  const isDbUpdateOK = sqlSaveResponse.affectedRows === 1;

  return isDbUpdateOK;
};

export const findCoordinatesSystem = async (): Promise<
  CoordinatesSystemType
> => {
  const systems = await queryToFindCoordinatesSystem();
  return systems && systems[0]?.system ? systems[0].system : null;
};
