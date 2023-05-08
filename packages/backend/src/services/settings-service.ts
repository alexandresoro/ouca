import { type CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { type Logger } from "pino";
import { type InputSettings } from "../graphql/generated/graphql-types.js";
import { type Departement } from "../repositories/departement/departement-repository-types.js";
import { type DepartementRepository } from "../repositories/departement/departement-repository.js";
import { type Observateur } from "../repositories/observateur/observateur-repository-types.js";
import { type ObservateurRepository } from "../repositories/observateur/observateur-repository.js";
import {
  type Settings as SettingsRepositoryType,
  type UpdateSettingsInput,
} from "../repositories/settings/settings-repository-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type LoggedUser } from "../types/User.js";
import { validateAuthorization } from "./entities/authorization-utils.js";

type SettingsServiceDependencies = {
  logger: Logger;
  settingsRepository: SettingsRepository;
  departementRepository: DepartementRepository;
  observateurRepository: ObservateurRepository;
};

type Settings = Omit<SettingsRepositoryType, "defaultDepartementId" | "defaultObservateurId"> & {
  defaultDepartment: Departement | null;
  defaultObserver: Observateur | null;
};

export const buildSettingsService = ({
  logger,
  settingsRepository,
  departementRepository,
  observateurRepository,
}: SettingsServiceDependencies) => {
  const findAppConfiguration = async (loggedUser: LoggedUser | null): Promise<Settings | null> => {
    validateAuthorization(loggedUser);

    const settings = await settingsRepository.getUserSettings(loggedUser.id);
    if (!settings) {
      return null;
    }

    const { defaultDepartementId, defaultObservateurId, ...restSettings } = settings;

    const [defaultDepartment, defaultObserver] = await Promise.all([
      defaultDepartementId != null
        ? departementRepository.findDepartementById(defaultDepartementId)
        : Promise.resolve(null),
      defaultObservateurId != null
        ? observateurRepository.findObservateurById(defaultObservateurId)
        : Promise.resolve(null),
    ]);

    return {
      ...restSettings,
      defaultDepartment,
      defaultObserver,
    };
  };

  const findCoordinatesSystem = async (loggedUser: LoggedUser | null): Promise<CoordinatesSystemType | undefined> => {
    return findAppConfiguration(loggedUser).then((settings) => settings?.coordinatesSystem);
  };

  const persistUserSettings = async (
    appConfiguration: InputSettings,
    loggedUser: LoggedUser | null
  ): Promise<SettingsRepositoryType> => {
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
    default_observateur_id: parseInt(appConfiguration.defaultObserver),
    default_departement_id: parseInt(appConfiguration.defaultDepartment),
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
