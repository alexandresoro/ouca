import type { SettingsEnriched, UpdateSettingsInput } from "@domain/settings/settings.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { SettingsRepository } from "@interfaces/settings-repository-interface.js";
import type { PutSettingsInput } from "@ou-ca/common/api/settings";
import { Result, err, ok } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { AgeService } from "../age/age-service.js";
import type { DepartmentService } from "../department/department-service.js";
import type { NumberEstimateService } from "../number-estimate/number-estimate-service.js";
import type { ObserverService } from "../observer/observer-service.js";
import type { SexService } from "../sex/sex-service.js";

type SettingsServiceDependencies = {
  settingsRepository: SettingsRepository;
  departmentService: DepartmentService;
  observerService: ObserverService;
  sexService: SexService;
  ageService: AgeService;
  numberEstimateService: NumberEstimateService;
};

export const buildSettingsService = ({
  settingsRepository,
  departmentService,
  observerService,
  sexService,
  ageService,
  numberEstimateService,
}: SettingsServiceDependencies) => {
  const getSettings = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<SettingsEnriched | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const settings = await settingsRepository.getUserSettings(loggedUser.id);
    if (!settings) {
      return ok(null);
    }

    const {
      defaultDepartementId,
      defaultObservateurId,
      defaultSexeId,
      defaultAgeId,
      defaultEstimationNombreId,
      ...restSettings
    } = settings;

    const defaultDepartmentResult =
      defaultDepartementId != null
        ? await departmentService.findDepartment(Number.parseInt(defaultDepartementId), loggedUser)
        : ok(null);

    const defaultObserverResult =
      defaultObservateurId != null
        ? await observerService.findObserver(Number.parseInt(defaultObservateurId), loggedUser)
        : ok(null);

    const defaultSexResult =
      defaultSexeId != null ? await sexService.findSex(Number.parseInt(defaultSexeId), loggedUser) : ok(null);

    const defaultAgeResult =
      defaultAgeId != null ? await ageService.findAge(Number.parseInt(defaultAgeId), loggedUser) : ok(null);

    const defaultNumberEstimateResult =
      defaultEstimationNombreId != null
        ? await numberEstimateService.findNumberEstimate(Number.parseInt(defaultEstimationNombreId), loggedUser)
        : ok(null);

    const getEnrichedDataResult = Result.combine([
      defaultDepartmentResult,
      defaultObserverResult,
      defaultSexResult,
      defaultAgeResult,
      defaultNumberEstimateResult,
    ]);

    if (getEnrichedDataResult.isErr()) {
      return err(getEnrichedDataResult.error);
    }

    const [defaultDepartment, defaultObserver, defaultSex, defaultAge, defaultNumberEstimate] =
      getEnrichedDataResult.value;

    return ok({
      ...restSettings,
      defaultDepartment,
      defaultObserver,
      defaultSex,
      defaultAge,
      defaultNumberEstimate,
    });
  };

  const updateUserSettings = async (
    inputUpdateSettings: PutSettingsInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SettingsEnriched, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const updateSettingsInput = buildSettingsFromInputSettings(inputUpdateSettings);

    logger.trace(
      {
        userId: loggedUser.id,
        updateSettingsInput,
      },
      `Saving user settings of User=${loggedUser.id}`,
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

    const defaultDepartmentResult =
      defaultDepartementId != null
        ? await departmentService.findDepartment(Number.parseInt(defaultDepartementId), loggedUser)
        : ok(null);

    const defaultObserverResult =
      defaultObservateurId != null
        ? await observerService.findObserver(Number.parseInt(defaultObservateurId), loggedUser)
        : ok(null);

    const defaultSexResult =
      defaultSexeId != null ? await sexService.findSex(Number.parseInt(defaultSexeId), loggedUser) : ok(null);

    const defaultAgeResult =
      defaultAgeId != null ? await ageService.findAge(Number.parseInt(defaultAgeId), loggedUser) : ok(null);

    const defaultNumberEstimateResult =
      defaultEstimationNombreId != null
        ? await numberEstimateService.findNumberEstimate(Number.parseInt(defaultEstimationNombreId), loggedUser)
        : ok(null);

    const getEnrichedDataResult = Result.combine([
      defaultDepartmentResult,
      defaultObserverResult,
      defaultSexResult,
      defaultAgeResult,
      defaultNumberEstimateResult,
    ]);

    if (getEnrichedDataResult.isErr()) {
      return err(getEnrichedDataResult.error);
    }

    const [defaultDepartment, defaultObserver, defaultSex, defaultAge, defaultNumberEstimate] =
      getEnrichedDataResult.value;

    return ok({
      ...restSettings,
      defaultDepartment,
      defaultObserver,
      defaultSex,
      defaultAge,
      defaultNumberEstimate,
    });
  };

  return {
    getSettings,
    updateUserSettings,
  };
};

export type SettingsService = ReturnType<typeof buildSettingsService>;

const buildSettingsFromInputSettings = (inputUpdateSettings: PutSettingsInput): UpdateSettingsInput => {
  return {
    defaultObservateurId: inputUpdateSettings.defaultObserver
      ? Number.parseInt(inputUpdateSettings.defaultObserver)
      : null,
    defaultDepartementId: inputUpdateSettings.defaultDepartment
      ? Number.parseInt(inputUpdateSettings.defaultDepartment)
      : null,
    defaultAgeId: inputUpdateSettings.defaultAge ? Number.parseInt(inputUpdateSettings.defaultAge) : null,
    defaultSexeId: inputUpdateSettings.defaultSexe ? Number.parseInt(inputUpdateSettings.defaultSexe) : null,
    defaultEstimationNombreId: inputUpdateSettings.defaultEstimationNombre
      ? Number.parseInt(inputUpdateSettings.defaultEstimationNombre)
      : null,
    defaultNombre: inputUpdateSettings.defaultNombre,
    areAssociesDisplayed: inputUpdateSettings.areAssociesDisplayed,
    isMeteoDisplayed: inputUpdateSettings.isMeteoDisplayed,
    isDistanceDisplayed: inputUpdateSettings.isDistanceDisplayed,
    isRegroupementDisplayed: inputUpdateSettings.isRegroupementDisplayed,
  };
};
