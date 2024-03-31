import type { SettingsEnriched } from "@domain/settings/settings.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { User } from "@domain/user/user.js";
import type { PutSettingsInput } from "@ou-ca/common/api/settings";
import { Result, err, ok } from "neverthrow";
import type { AgeService } from "../age/age-service.js";
import type { DepartmentService } from "../department/department-service.js";
import type { NumberEstimateService } from "../number-estimate/number-estimate-service.js";
import type { ObserverService } from "../observer/observer-service.js";
import type { SexService } from "../sex/sex-service.js";
import type { UserService } from "../user/user-service.js";

type SettingsServiceDependencies = {
  userService: UserService;
  departmentService: DepartmentService;
  observerService: ObserverService;
  sexService: SexService;
  ageService: AgeService;
  numberEstimateService: NumberEstimateService;
};

export const buildSettingsService = ({
  userService,
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

    const user = await userService.getUser(loggedUser.id);
    if (!user?.settings) {
      return ok(null);
    }

    const { id, settings } = user;

    const { defaultDepartmentId, defaultObserverId, defaultSexId, defaultAgeId, defaultNumberEstimateId } = settings;

    const defaultDepartmentResult =
      defaultDepartmentId != null
        ? await departmentService.findDepartment(Number.parseInt(defaultDepartmentId), loggedUser)
        : ok(null);

    const defaultObserverResult =
      defaultObserverId != null
        ? await observerService.findObserver(Number.parseInt(defaultObserverId), loggedUser)
        : ok(null);

    const defaultSexResult =
      defaultSexId != null ? await sexService.findSex(Number.parseInt(defaultSexId), loggedUser) : ok(null);

    const defaultAgeResult =
      defaultAgeId != null ? await ageService.findAge(Number.parseInt(defaultAgeId), loggedUser) : ok(null);

    const defaultNumberEstimateResult =
      defaultNumberEstimateId != null
        ? await numberEstimateService.findNumberEstimate(Number.parseInt(defaultNumberEstimateId), loggedUser)
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
      defaultDepartment,
      defaultObserver,
      defaultSex,
      defaultAge,
      defaultNumberEstimate,
      defaultNombre: settings.defaultNumber ?? null,
      areAssociesDisplayed: settings.displayAssociates ?? true,
      isMeteoDisplayed: settings.displayWeather ?? true,
      isDistanceDisplayed: settings.displayDistance ?? true,
      isRegroupementDisplayed: settings.displayGrouping ?? true,
      userId: id,
    });
  };

  const updateUserSettings = async (
    inputUpdateSettings: PutSettingsInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<SettingsEnriched, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Temporary sync to user service settings
    const updatedSettingsUser = {
      defaultObserverId: inputUpdateSettings.defaultObserver ?? undefined,
      defaultDepartmentId: inputUpdateSettings.defaultDepartment ?? undefined,
      defaultAgeId: inputUpdateSettings.defaultAge ?? undefined,
      defaultSexId: inputUpdateSettings.defaultSexe ?? undefined,
      defaultNumberEstimateId: inputUpdateSettings.defaultEstimationNombre ?? undefined,
      defaultNumber: inputUpdateSettings.defaultNombre ?? undefined,
      displayAssociates: inputUpdateSettings.areAssociesDisplayed ?? undefined,
      displayWeather: inputUpdateSettings.isMeteoDisplayed ?? undefined,
      displayDistance: inputUpdateSettings.isDistanceDisplayed ?? undefined,
      displayGrouping: inputUpdateSettings.isRegroupementDisplayed ?? undefined,
    } satisfies User["settings"];

    const { id, settings: updatedSettingsNew } = await userService.updateSettings(loggedUser.id, updatedSettingsUser);

    const {
      defaultDepartmentId,
      defaultObserverId,
      defaultSexId,
      defaultAgeId,
      defaultNumberEstimateId,
      ...restSettingsNew
    } = updatedSettingsNew ?? {};

    const defaultDepartmentResult =
      defaultDepartmentId != null
        ? await departmentService.findDepartment(Number.parseInt(defaultDepartmentId), loggedUser)
        : ok(null);

    const defaultObserverResult =
      defaultObserverId != null
        ? await observerService.findObserver(Number.parseInt(defaultObserverId), loggedUser)
        : ok(null);

    const defaultSexResult =
      defaultSexId != null ? await sexService.findSex(Number.parseInt(defaultSexId), loggedUser) : ok(null);

    const defaultAgeResult =
      defaultAgeId != null ? await ageService.findAge(Number.parseInt(defaultAgeId), loggedUser) : ok(null);

    const defaultNumberEstimateResult =
      defaultNumberEstimateId != null
        ? await numberEstimateService.findNumberEstimate(Number.parseInt(defaultNumberEstimateId), loggedUser)
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
      defaultDepartment,
      defaultObserver,
      defaultSex,
      defaultAge,
      defaultNumberEstimate,
      defaultNombre: restSettingsNew.defaultNumber ?? null,
      areAssociesDisplayed: restSettingsNew.displayAssociates ?? true,
      isMeteoDisplayed: restSettingsNew.displayWeather ?? true,
      isDistanceDisplayed: restSettingsNew.displayDistance ?? true,
      isRegroupementDisplayed: restSettingsNew.displayGrouping ?? true,
      userId: id,
    });
  };

  return {
    getSettings,
    updateUserSettings,
  };
};

export type SettingsService = ReturnType<typeof buildSettingsService>;
