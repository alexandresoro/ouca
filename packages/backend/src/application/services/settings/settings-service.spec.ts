import { OucaError } from "@domain/errors/ouca-error.js";
import { settingsFactory } from "@fixtures/domain/settings/settings.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { ageServiceFactory } from "@fixtures/services/age/age-service.fixtures.js";
import { observerServiceFactory } from "@fixtures/services/observer/observer-service.fixtures.js";
import { sexServiceFactory } from "@fixtures/services/sex/sex-service.fixtures.js";
import { type SettingsRepository } from "@interfaces/settings-repository-interface.js";
import { type PutSettingsInput } from "@ou-ca/common/api/settings";
import { ok } from "neverthrow";
import { type DepartementService } from "../../../services/entities/department/department-service.js";
import { type EstimationNombreService } from "../../../services/entities/number-estimate/number-estimate-service.js";
import { mockVi } from "../../../utils/mock.js";
import { type AgeService } from "../age/age-service.js";
import { type ObserverService } from "../observer/observer-service.js";
import { type SexService } from "../sex/sex-service.js";
import { buildSettingsService } from "./settings-service.js";

const settingsRepository = mockVi<SettingsRepository>();
const departmentService = mockVi<DepartementService>();
const observerService = mockVi<ObserverService>();
const sexService = mockVi<SexService>();
const ageService = mockVi<AgeService>();
const numberEstimateService = mockVi<EstimationNombreService>();

const settingsService = buildSettingsService({
  settingsRepository,
  departmentService,
  observerService,
  sexService,
  ageService,
  numberEstimateService,
});

describe("Fetch app configuration for user", () => {
  test("should query needed parameters for user", async () => {
    const loggedUser = loggedUserFactory.build();

    const mockResolved = settingsFactory.build({
      defaultDepartementId: "7",
      defaultObservateurId: "13",
    });
    settingsRepository.getUserSettings.mockResolvedValueOnce(mockResolved);
    ageService.findAge.mockResolvedValueOnce(ok(ageServiceFactory.build()));
    observerService.findObserver.mockResolvedValueOnce(ok(observerServiceFactory.build()));
    sexService.findSex.mockResolvedValueOnce(ok(sexServiceFactory.build()));

    await settingsService.getSettings(loggedUser);

    expect(settingsRepository.getUserSettings).toHaveBeenCalledTimes(1);
    expect(settingsRepository.getUserSettings).toHaveBeenCalledWith(loggedUser.id);
    expect(departmentService.findDepartement).toHaveBeenCalledTimes(1);
    expect(departmentService.findDepartement).toHaveBeenCalledWith(7, loggedUser);
    expect(observerService.findObserver).toHaveBeenCalledTimes(1);
    expect(observerService.findObserver).toHaveBeenCalledWith(13, loggedUser);
  });

  test("should query needed parameters for user when some of them are not defined", async () => {
    const loggedUser = loggedUserFactory.build();

    const mockResolved = settingsFactory.build({
      defaultDepartementId: null,
      defaultObservateurId: null,
    });
    settingsRepository.getUserSettings.mockResolvedValueOnce(mockResolved);
    ageService.findAge.mockResolvedValueOnce(ok(ageServiceFactory.build()));
    sexService.findSex.mockResolvedValueOnce(ok(sexServiceFactory.build()));

    await settingsService.getSettings(loggedUser);

    expect(settingsRepository.getUserSettings).toHaveBeenCalledTimes(1);
    expect(settingsRepository.getUserSettings).toHaveBeenCalledWith(loggedUser.id);
    expect(departmentService.findDepartement).not.toHaveBeenCalled();
    expect(observerService.findObserver).not.toHaveBeenCalled();
  });

  test("should throw an error when no logged user provided", async () => {
    await expect(settingsService.getSettings(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(settingsRepository.getUserSettings).not.toHaveBeenCalled();
  });
});

test("should update settings with parameters for user", async () => {
  const updatedAppConfiguration = {
    areAssociesDisplayed: true,
    defaultAge: "1",
    defaultDepartment: "2",
    defaultEstimationNombre: "3",
    defaultNombre: 4,
    defaultObserver: "5",
    defaultSexe: null,
    isDistanceDisplayed: true,
    isMeteoDisplayed: true,
    isRegroupementDisplayed: true,
  } satisfies PutSettingsInput;

  const loggedUser = loggedUserFactory.build();

  const mockResolved = settingsFactory.build({
    defaultDepartementId: "2",
    defaultObservateurId: "5",
  });
  settingsRepository.updateUserSettings.mockResolvedValueOnce(mockResolved);
  ageService.findAge.mockResolvedValueOnce(ok(ageServiceFactory.build()));
  observerService.findObserver.mockResolvedValueOnce(ok(observerServiceFactory.build()));
  sexService.findSex.mockResolvedValueOnce(ok(sexServiceFactory.build()));

  await settingsService.updateUserSettings(updatedAppConfiguration, loggedUser);

  expect(settingsRepository.updateUserSettings).toHaveBeenCalledTimes(1);
  expect(settingsRepository.updateUserSettings).toHaveBeenCalledWith(loggedUser.id, {
    areAssociesDisplayed: true,
    defaultAgeId: 1,
    defaultDepartementId: 2,
    defaultEstimationNombreId: 3,
    defaultNombre: 4,
    defaultObservateurId: 5,
    defaultSexeId: null,
    isDistanceDisplayed: true,
    isMeteoDisplayed: true,
    isRegroupementDisplayed: true,
  });
  expect(departmentService.findDepartement).toHaveBeenCalledTimes(1);
  expect(departmentService.findDepartement).toHaveBeenCalledWith(2, loggedUser);
  expect(observerService.findObserver).toHaveBeenCalledTimes(1);
  expect(observerService.findObserver).toHaveBeenCalledWith(5, loggedUser);
});
