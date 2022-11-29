import { type Settings as SettingsDb } from "@prisma/client";
import { type Logger } from "pino";
import { type InputSettings } from "../graphql/generated/graphql-types";
import { type CoordinatesSystemType } from "../model/coordinates-system/coordinates-system.object";
import { type SettingsRepository } from "../repositories/settings/settings-repository";
import { type Settings } from "../repositories/settings/settings-repository-types";
import prisma from "../sql/prisma";
import { type LoggedUser } from "../types/User";
import { validateAuthorization } from "./entities/authorization-utils";

type SettingsServiceDependencies = {
  logger: Logger;
  settingsRepository: SettingsRepository;
};

export const buildSettingsService = ({ logger, settingsRepository }: SettingsServiceDependencies) => {
  const findAppConfiguration = async (loggedUser: LoggedUser | null): Promise<Settings | null> => {
    validateAuthorization(loggedUser);

    return settingsRepository.getUserSettings(loggedUser!.id);
  };

  const findCoordinatesSystem = async (loggedUser: LoggedUser | null): Promise<CoordinatesSystemType | undefined> => {
    return findAppConfiguration(loggedUser).then((settings) => settings?.coordinatesSystem);
  };

  return {
    findAppConfiguration,
    findCoordinatesSystem,
  };
};

export type SettingsService = ReturnType<typeof buildSettingsService>;

/**
 * @deprecated
 */
export const findCoordinatesSystem = async (loggedUser: LoggedUser): Promise<CoordinatesSystemType | undefined> => {
  return prisma.settings
    .findUnique({
      where: {
        userId: loggedUser.id,
      },
    })
    .then((settings) => settings?.coordinatesSystem);
};

const buildSettingsDbFromInputSettings = (appConfiguration: InputSettings): Omit<SettingsDb, "userId"> => {
  return {
    id: appConfiguration.id,
    defaultObservateurId: appConfiguration.defaultObservateur,
    defaultDepartementId: appConfiguration.defaultDepartement,
    defaultAgeId: appConfiguration.defaultAge,
    defaultSexeId: appConfiguration.defaultSexe,
    defaultEstimationNombreId: appConfiguration.defaultEstimationNombre,
    defaultNombre: appConfiguration.defaultNombre,
    areAssociesDisplayed: appConfiguration.areAssociesDisplayed,
    isMeteoDisplayed: appConfiguration.isMeteoDisplayed,
    isDistanceDisplayed: appConfiguration.isDistanceDisplayed,
    isRegroupementDisplayed: appConfiguration.isRegroupementDisplayed,
    coordinatesSystem: appConfiguration.coordinatesSystem,
  };
};

export const persistUserSettings = async (
  appConfiguration: InputSettings,
  loggedUser: LoggedUser | null
): Promise<Settings> => {
  validateAuthorization(loggedUser);

  const { id, ...settings } = buildSettingsDbFromInputSettings(appConfiguration);

  const updatedSettingsDb = await prisma.settings.update({
    data: settings,
    where: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userId: loggedUser!.id,
    },
  });

  return updatedSettingsDb;
};
