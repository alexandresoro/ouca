
import { CoordinatesSystemType } from "../../model/coordinates-system/coordinates-system.object";
import { AppConfiguration } from "../../model/types/app-configuration.object";
import { SettingsDb } from "../../objects/db/settings-db.object";
import { buildAppConfigurationFromSettingsDb, buildSettingsDbFromAppConfiguration } from "../../sql/entities-mapping/settings-mapping";
import prisma from "../../sql/prisma";
import { TABLE_SETTINGS } from "../../utils/constants";
import { findAllAges } from "./age-service";
import { findAllDepartements } from "./departement-service";
import { persistEntityNoCheck } from "./entity-service";
import { findAllEstimationsNombre } from "./estimation-nombre-service";
import { findAllObservateurs } from "./observateur-service";
import { findAllSexes } from "./sexe-service";

const findUserSettings = async (): Promise<SettingsDb> => {
  return await prisma.settings.findFirst();
};

export const findAppConfiguration = async (): Promise<AppConfiguration> => {
  const [
    settings,
    observateurs,
    departements,
    ages,
    sexes,
    estimationsNombre,
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
    observateurs,
    departements,
    ages,
    sexes,
    estimationsNombre
  );
};

export const persistUserSettings = async (
  appConfiguration: AppConfiguration
): Promise<boolean> => {
  const settingsDb: SettingsDb = buildSettingsDbFromAppConfiguration(
    appConfiguration
  );

  const sqlSaveResponse = await persistEntityNoCheck(TABLE_SETTINGS, settingsDb);

  const isDbUpdateOK = sqlSaveResponse.affectedRows === 1;

  return isDbUpdateOK;
};

export const findCoordinatesSystem = async (): Promise<
  CoordinatesSystemType
> => {
  return prisma.settings.findFirst().then(settings => settings.coordinates_system);
};
