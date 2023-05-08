import { type PutSettingsInput } from "@ou-ca/common/api/settings.js";
import { type CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { type Logger } from "pino";
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
  const getSettings = async (loggedUser: LoggedUser | null): Promise<Settings | null> => {
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
    return getSettings(loggedUser).then((settings) => settings?.coordinatesSystem);
  };

  const updateUserSettings = async (
    inputUpdateSettings: PutSettingsInput,
    loggedUser: LoggedUser | null
  ): Promise<Settings> => {
    validateAuthorization(loggedUser);

    const updateSettingsInput = buildSettingsDbFromInputSettings(inputUpdateSettings);

    logger.trace(
      {
        userId: loggedUser.id,
        updateSettingsInput,
      },
      `Saving user settings of User=${loggedUser.id}`
    );

    const updatedSettings = await settingsRepository.updateUserSettings(loggedUser.id, updateSettingsInput);

    const { defaultDepartementId, defaultObservateurId, ...restSettings } = updatedSettings;

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

  return {
    getSettings,
    findCoordinatesSystem,
    updateUserSettings,
  };
};

export type SettingsService = ReturnType<typeof buildSettingsService>;

const buildSettingsDbFromInputSettings = (inputUpdateSettings: PutSettingsInput): UpdateSettingsInput => {
  return {
    default_observateur_id: parseInt(inputUpdateSettings.defaultObserver),
    default_departement_id: parseInt(inputUpdateSettings.defaultDepartment),
    default_age_id: inputUpdateSettings.defaultAge,
    default_sexe_id: inputUpdateSettings.defaultSexe,
    default_estimation_nombre_id: inputUpdateSettings.defaultEstimationNombre,
    default_nombre: inputUpdateSettings.defaultNombre,
    are_associes_displayed: inputUpdateSettings.areAssociesDisplayed,
    is_meteo_displayed: inputUpdateSettings.isMeteoDisplayed,
    is_distance_displayed: inputUpdateSettings.isDistanceDisplayed,
    is_regroupement_displayed: inputUpdateSettings.isRegroupementDisplayed,
    coordinates_system: inputUpdateSettings.coordinatesSystem,
  };
};
