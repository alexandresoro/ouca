import { type PutSettingsInput } from "@ou-ca/common/api/settings";
import { type Age } from "@ou-ca/common/entities/age";
import { type Department } from "@ou-ca/common/entities/department";
import { type NumberEstimate } from "@ou-ca/common/entities/number-estimate";
import { type Observer } from "@ou-ca/common/entities/observer";
import { type Sex } from "@ou-ca/common/entities/sex";
import { type Logger } from "pino";
import {
  type Settings as SettingsRepositoryType,
  type UpdateSettingsInput,
} from "../repositories/settings/settings-repository-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type LoggedUser } from "../types/User.js";
import { type AgeService } from "./entities/age-service.js";
import { validateAuthorization } from "./entities/authorization-utils.js";
import { type DepartementService } from "./entities/departement-service.js";
import { type EstimationNombreService } from "./entities/estimation-nombre-service.js";
import { type ObservateurService } from "./entities/observateur-service.js";
import { type SexeService } from "./entities/sexe-service.js";

type SettingsServiceDependencies = {
  logger: Logger;
  settingsRepository: SettingsRepository;
  departementService: DepartementService;
  observateurService: ObservateurService;
  sexeService: SexeService;
  ageService: AgeService;
  estimationNombreService: EstimationNombreService;
};

type Settings = Omit<
  SettingsRepositoryType,
  "defaultDepartementId" | "defaultObservateurId" | "defaultSexeId" | "defaultAgeId" | "defaultEstimationNombreId"
> & {
  defaultDepartment: Department | null;
  defaultObserver: Observer | null;
  defaultSex: Sex | null;
  defaultAge: Age | null;
  defaultNumberEstimate: NumberEstimate | null;
};

export const buildSettingsService = ({
  logger,
  settingsRepository,
  departementService,
  observateurService,
  sexeService,
  ageService,
  estimationNombreService,
}: SettingsServiceDependencies) => {
  const getSettings = async (loggedUser: LoggedUser | null): Promise<Settings | null> => {
    validateAuthorization(loggedUser);

    const settings = await settingsRepository.getUserSettings(loggedUser.id);
    if (!settings) {
      return null;
    }

    const {
      defaultDepartementId,
      defaultObservateurId,
      defaultSexeId,
      defaultAgeId,
      defaultEstimationNombreId,
      ...restSettings
    } = settings;

    const [defaultDepartment, defaultObserver, defaultSex, defaultAge, defaultNumberEstimate] = await Promise.all([
      defaultDepartementId != null
        ? departementService.findDepartement(parseInt(defaultDepartementId), loggedUser)
        : Promise.resolve(null),
      defaultObservateurId != null
        ? observateurService.findObservateur(parseInt(defaultObservateurId), loggedUser)
        : Promise.resolve(null),
      defaultSexeId != null ? sexeService.findSexe(parseInt(defaultSexeId), loggedUser) : Promise.resolve(null),
      defaultAgeId != null ? ageService.findAge(parseInt(defaultAgeId), loggedUser) : Promise.resolve(null),
      defaultEstimationNombreId != null
        ? estimationNombreService.findEstimationNombre(parseInt(defaultEstimationNombreId), loggedUser)
        : Promise.resolve(null),
    ]);

    return {
      ...restSettings,
      defaultDepartment,
      defaultObserver,
      defaultSex,
      defaultAge,
      defaultNumberEstimate,
    };
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

    const {
      defaultDepartementId,
      defaultObservateurId,
      defaultSexeId,
      defaultAgeId,
      defaultEstimationNombreId,
      ...restSettings
    } = updatedSettings;

    const [defaultDepartment, defaultObserver, defaultSex, defaultAge, defaultNumberEstimate] = await Promise.all([
      defaultDepartementId != null
        ? departementService.findDepartement(parseInt(defaultDepartementId), loggedUser)
        : Promise.resolve(null),
      defaultObservateurId != null
        ? observateurService.findObservateur(parseInt(defaultObservateurId), loggedUser)
        : Promise.resolve(null),
      defaultSexeId != null ? sexeService.findSexe(parseInt(defaultSexeId), loggedUser) : Promise.resolve(null),
      defaultAgeId != null ? ageService.findAge(parseInt(defaultAgeId), loggedUser) : Promise.resolve(null),
      defaultEstimationNombreId != null
        ? estimationNombreService.findEstimationNombre(parseInt(defaultEstimationNombreId), loggedUser)
        : Promise.resolve(null),
    ]);

    return {
      ...restSettings,
      defaultDepartment,
      defaultObserver,
      defaultSex,
      defaultAge,
      defaultNumberEstimate,
    };
  };

  return {
    getSettings,
    updateUserSettings,
  };
};

export type SettingsService = ReturnType<typeof buildSettingsService>;

const buildSettingsDbFromInputSettings = (inputUpdateSettings: PutSettingsInput): UpdateSettingsInput => {
  return {
    default_observateur_id: inputUpdateSettings.defaultObserver ? parseInt(inputUpdateSettings.defaultObserver) : null,
    default_departement_id: inputUpdateSettings.defaultDepartment
      ? parseInt(inputUpdateSettings.defaultDepartment)
      : null,
    default_age_id: inputUpdateSettings.defaultAge ? parseInt(inputUpdateSettings.defaultAge) : null,
    default_sexe_id: inputUpdateSettings.defaultSexe ? parseInt(inputUpdateSettings.defaultSexe) : null,
    default_estimation_nombre_id: inputUpdateSettings.defaultEstimationNombre
      ? parseInt(inputUpdateSettings.defaultEstimationNombre)
      : null,
    default_nombre: inputUpdateSettings.defaultNombre,
    are_associes_displayed: inputUpdateSettings.areAssociesDisplayed,
    is_meteo_displayed: inputUpdateSettings.isMeteoDisplayed,
    is_distance_displayed: inputUpdateSettings.isDistanceDisplayed,
    is_regroupement_displayed: inputUpdateSettings.isRegroupementDisplayed,
  };
};
