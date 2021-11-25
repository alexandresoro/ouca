
import { CoordinatesSystem, Settings as SettingsDb } from "@prisma/client";
import { InputSettings, Settings } from "../../model/graphql";
import prisma from "../../sql/prisma";

const includedElements = {
  defaultObservateur: true,
  defaultDepartement: true,
  defaultAge: true,
  defaultSexe: true,
  defaultEstimationNombre: true
}

export const findAppConfiguration = async (): Promise<Settings> => {

  const settingsDb = await prisma.settings.findFirst({
    include: includedElements
  });

  return settingsDb;
};

export const findCoordinatesSystem = async (): Promise<CoordinatesSystem> => {
  return prisma.settings.findFirst().then(settings => settings.coordinatesSystem);
};


const buildSettingsDbFromInputSettings = (
  appConfiguration: InputSettings
): SettingsDb => {
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

export const persistUserSettings = async (appConfiguration: InputSettings): Promise<Settings> => {

  const { id, ...settings } = buildSettingsDbFromInputSettings(appConfiguration);

  const updatedSettingsDb = await prisma.settings.update({
    data: settings,
    include: includedElements,
    where: {
      id
    }
  });

  return updatedSettingsDb;
};
