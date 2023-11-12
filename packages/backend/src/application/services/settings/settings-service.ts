import { type SettingsEnriched, type UpdateSettingsInput } from "@domain/settings/settings.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type SettingsRepository } from "@interfaces/settings-repository-interface.js";
import { type PutSettingsInput } from "@ou-ca/common/api/settings";
import { type Logger } from "pino";
import { type AgeService } from "../../../services/entities/age-service.js";
import { validateAuthorization } from "../../../services/entities/authorization-utils.js";
import { type DepartementService } from "../../../services/entities/departement-service.js";
import { type EstimationNombreService } from "../../../services/entities/estimation-nombre-service.js";
import { type ObservateurService } from "../../../services/entities/observateur-service.js";
import { type SexeService } from "../../../services/entities/sexe-service.js";

type SettingsServiceDependencies = {
  logger: Logger;
  settingsRepository: SettingsRepository;
  departementService: DepartementService;
  observateurService: ObservateurService;
  sexeService: SexeService;
  ageService: AgeService;
  estimationNombreService: EstimationNombreService;
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
  const getSettings = async (loggedUser: LoggedUser | null): Promise<SettingsEnriched | null> => {
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
  ): Promise<SettingsEnriched> => {
    validateAuthorization(loggedUser);

    const updateSettingsInput = buildSettingsFromInputSettings(inputUpdateSettings);

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

const buildSettingsFromInputSettings = (inputUpdateSettings: PutSettingsInput): UpdateSettingsInput => {
  return {
    defaultObservateurId: inputUpdateSettings.defaultObserver ? parseInt(inputUpdateSettings.defaultObserver) : null,
    defaultDepartementId: inputUpdateSettings.defaultDepartment
      ? parseInt(inputUpdateSettings.defaultDepartment)
      : null,
    defaultAgeId: inputUpdateSettings.defaultAge ? parseInt(inputUpdateSettings.defaultAge) : null,
    defaultSexeId: inputUpdateSettings.defaultSexe ? parseInt(inputUpdateSettings.defaultSexe) : null,
    defaultEstimationNombreId: inputUpdateSettings.defaultEstimationNombre
      ? parseInt(inputUpdateSettings.defaultEstimationNombre)
      : null,
    defaultNombre: inputUpdateSettings.defaultNombre,
    areAssociesDisplayed: inputUpdateSettings.areAssociesDisplayed,
    isMeteoDisplayed: inputUpdateSettings.isMeteoDisplayed,
    isDistanceDisplayed: inputUpdateSettings.isDistanceDisplayed,
    isRegroupementDisplayed: inputUpdateSettings.isRegroupementDisplayed,
  };
};
