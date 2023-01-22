import { type CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { type Logger } from "pino";
import { type InputSettings } from "../graphql/generated/graphql-types.js";
import { type Settings, type UpdateSettingsInput } from "../repositories/settings/settings-repository-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type LoggedUser } from "../types/User.js";
import { validateAuthorization } from "./entities/authorization-utils.js";

type SettingsServiceDependencies = {
  logger: Logger;
  settingsRepository: SettingsRepository;
};

export const buildSettingsService = ({ logger, settingsRepository }: SettingsServiceDependencies) => {
  const findAppConfiguration = async (loggedUser: LoggedUser | null): Promise<Settings | null> => {
    validateAuthorization(loggedUser);

    return settingsRepository.getUserSettings(loggedUser.id);
  };

  const findCoordinatesSystem = async (loggedUser: LoggedUser | null): Promise<CoordinatesSystemType | undefined> => {
    return findAppConfiguration(loggedUser).then((settings) => settings?.coordinatesSystem);
  };

  const persistUserSettings = async (
    appConfiguration: InputSettings,
    loggedUser: LoggedUser | null
  ): Promise<Settings> => {
    validateAuthorization(loggedUser);

    const updateSettingsInput = buildSettingsDbFromInputSettings(appConfiguration);

    logger.trace(
      {
        id: appConfiguration.id,
        updateSettingsInput,
      },
      `Saving user settings of User=${loggedUser.id} for ID=${appConfiguration.id}`
    );

    return settingsRepository.updateUserSettings(loggedUser.id, updateSettingsInput);
  };

  return {
    findAppConfiguration,
    findCoordinatesSystem,
    persistUserSettings,
  };
};

export type SettingsService = ReturnType<typeof buildSettingsService>;

const buildSettingsDbFromInputSettings = (appConfiguration: InputSettings): UpdateSettingsInput => {
  return {
    default_observateur_id: appConfiguration.defaultObservateur,
    default_departement_id: appConfiguration.defaultDepartement,
    default_age_id: appConfiguration.defaultAge,
    default_sexe_id: appConfiguration.defaultSexe,
    default_estimation_nombre_id: appConfiguration.defaultEstimationNombre,
    default_nombre: appConfiguration.defaultNombre,
    are_associes_displayed: appConfiguration.areAssociesDisplayed,
    is_meteo_displayed: appConfiguration.isMeteoDisplayed,
    is_distance_displayed: appConfiguration.isDistanceDisplayed,
    is_regroupement_displayed: appConfiguration.isRegroupementDisplayed,
    coordinates_system: appConfiguration.coordinatesSystem,
  };
};
