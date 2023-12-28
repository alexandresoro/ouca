import { type SettingsEnriched, type UpdateSettingsInput } from "@domain/settings/settings.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type SettingsRepository } from "@interfaces/settings-repository-interface.js";
import { type PutSettingsInput } from "@ou-ca/common/api/settings";
import { type DepartementService } from "../../../services/entities/departement-service.js";
import { type EstimationNombreService } from "../../../services/entities/estimation-nombre-service.js";
import { logger } from "../../../utils/logger.js";
import { type AgeService } from "../age/age-service.js";
import { validateAuthorization } from "../authorization/authorization-utils.js";
import { type ObserverService } from "../observer/observer-service.js";
import { type SexService } from "../sex/sex-service.js";

type SettingsServiceDependencies = {
  settingsRepository: SettingsRepository;
  departementService: DepartementService;
  observerService: ObserverService;
  sexService: SexService;
  ageService: AgeService;
  estimationNombreService: EstimationNombreService;
};

export const buildSettingsService = ({
  settingsRepository,
  departementService,
  observerService,
  sexService,
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
        ? (await observerService.findObserver(parseInt(defaultObservateurId), loggedUser))._unsafeUnwrap()
        : Promise.resolve(null),
      defaultSexeId != null
        ? (await sexService.findSex(parseInt(defaultSexeId), loggedUser))._unsafeUnwrap()
        : Promise.resolve(null),
      defaultAgeId != null
        ? (await ageService.findAge(parseInt(defaultAgeId), loggedUser))._unsafeUnwrap()
        : Promise.resolve(null),
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
        ? (await observerService.findObserver(parseInt(defaultObservateurId), loggedUser))._unsafeUnwrap()
        : Promise.resolve(null),
      defaultSexeId != null
        ? (await sexService.findSex(parseInt(defaultSexeId), loggedUser))._unsafeUnwrap()
        : Promise.resolve(null),
      defaultAgeId != null
        ? (await ageService.findAge(parseInt(defaultAgeId), loggedUser))._unsafeUnwrap()
        : Promise.resolve(null),
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
