
import { CoordinatesSystem } from "@prisma/client";
import { InputSettings, Settings } from "../../model/graphql";
import { buildSettingsDbFromInputSettings, buildSettingsFromSettingsDb } from "../../sql/entities-mapping/settings-mapping";
import prisma from "../../sql/prisma";

const includedElements = {
  observateur: true,
  departement: true,
  age: true,
  sexe: true,
  estimation_nombre: true
}

export const findAppConfiguration = async (): Promise<Settings> => {

  const settingsDb = await prisma.settings.findFirst({
    include: includedElements
  });

  return buildSettingsFromSettingsDb(settingsDb);
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

  return buildSettingsFromSettingsDb(updatedSettingsDb);
};

export const findCoordinatesSystem = async (): Promise<CoordinatesSystem> => {
  return prisma.settings.findFirst().then(settings => settings.coordinates_system);
};
