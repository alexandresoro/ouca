import { type PutSettingsInput } from "@ou-ca/common/api/settings";
import { type CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { type Department } from "@ou-ca/common/entities/department";
import { type Observer } from "@ou-ca/common/entities/observer";
import { type Logger } from "pino";
import {
  type Settings as SettingsRepositoryType,
  type UpdateSettingsInput,
} from "../repositories/settings/settings-repository-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type LoggedUser } from "../types/User.js";
import { validateAuthorization } from "./entities/authorization-utils.js";
import { type DepartementService } from "./entities/departement-service.js";
import { type ObservateurService } from "./entities/observateur-service.js";

type SettingsServiceDependencies = {
  logger: Logger;
  settingsRepository: SettingsRepository;
  departementService: DepartementService;
  observateurService: ObservateurService;
};

type Settings = Omit<SettingsRepositoryType, "defaultDepartementId" | "defaultObservateurId"> & {
  defaultDepartment: Department | null;
  defaultObserver: Observer | null;
};

export const buildSettingsService = ({
  logger,
  settingsRepository,
  departementService,
  observateurService,
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
        ? departementService.findDepartement(defaultDepartementId, loggedUser)
        : Promise.resolve(null),
      defaultObservateurId != null
        ? observateurService.findObservateur(defaultObservateurId, loggedUser)
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
        ? departementService.findDepartement(defaultDepartementId, loggedUser)
        : Promise.resolve(null),
      defaultObservateurId != null
        ? observateurService.findObservateur(defaultObservateurId, loggedUser)
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
