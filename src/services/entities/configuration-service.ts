import { CoordinatesSystem, Settings as SettingsDb } from "@prisma/client";
import { InputSettings, Settings } from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";

const includedElements = {
  defaultObservateur: true,
  defaultDepartement: true,
  defaultAge: true,
  defaultSexe: true,
  defaultEstimationNombre: true
};

export const findAppConfiguration = async (loggedUser: LoggedUser): Promise<Settings | null> => {
  return prisma.settings.findUnique({
    include: includedElements,
    where: {
      userId: loggedUser.id
    }
  });
};

export const findCoordinatesSystem = async (loggedUser: LoggedUser): Promise<CoordinatesSystem | undefined> => {
  return prisma.settings
    .findUnique({
      where: {
        userId: loggedUser.id
      }
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
    coordinatesSystem: appConfiguration.coordinatesSystem
  };
};

export const persistUserSettings = async (
  appConfiguration: InputSettings,
  loggedUser: LoggedUser
): Promise<Settings> => {
  const { id, ...settings } = buildSettingsDbFromInputSettings(appConfiguration);

  const updatedSettingsDb = await prisma.settings.update({
    data: settings,
    include: includedElements,
    where: {
      id,
      userId: loggedUser.id
    }
  });

  return updatedSettingsDb;
};
