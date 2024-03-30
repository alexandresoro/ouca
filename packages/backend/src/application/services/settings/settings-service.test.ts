import assert from "node:assert/strict";
import test, { beforeEach, describe } from "node:test";
import { settingsFactory } from "@fixtures/domain/settings/settings.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { ageServiceFactory } from "@fixtures/services/age/age-service.fixtures.js";
import { departmentServiceFactory } from "@fixtures/services/department/department-service.fixtures.js";
import { numberEstimateServiceFactory } from "@fixtures/services/number-estimate/number-estimate-service.fixtures.js";
import { observerServiceFactory } from "@fixtures/services/observer/observer-service.fixtures.js";
import { sexServiceFactory } from "@fixtures/services/sex/sex-service.fixtures.js";
import type { SettingsRepository } from "@interfaces/settings-repository-interface.js";
import type { PutSettingsInput } from "@ou-ca/common/api/settings";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import type { AgeService } from "../age/age-service.js";
import type { DepartmentService } from "../department/department-service.js";
import type { NumberEstimateService } from "../number-estimate/number-estimate-service.js";
import type { ObserverService } from "../observer/observer-service.js";
import type { SexService } from "../sex/sex-service.js";
import type { UserService } from "../user/user-service.js";
import { buildSettingsService } from "./settings-service.js";

const settingsRepository = mock<SettingsRepository>();
const userService = mock<UserService>();
const departmentService = mock<DepartmentService>();
const observerService = mock<ObserverService>();
const sexService = mock<SexService>();
const ageService = mock<AgeService>();
const numberEstimateService = mock<NumberEstimateService>();

const settingsService = buildSettingsService({
  settingsRepository,
  userService,
  departmentService,
  observerService,
  sexService,
  ageService,
  numberEstimateService,
});

beforeEach(() => {
  settingsRepository.getUserSettings.mock.resetCalls();
  settingsRepository.updateUserSettings.mock.resetCalls();
  departmentService.findDepartment.mock.resetCalls();
  observerService.findObserver.mock.resetCalls();
  sexService.findSex.mock.resetCalls();
  ageService.findAge.mock.resetCalls();
  numberEstimateService.findNumberEstimate.mock.resetCalls();
});

describe("Fetch app configuration for user", () => {
  test("should query needed parameters for user", async () => {
    const loggedUser = loggedUserFactory.build();

    const mockResolved = settingsFactory.build({
      defaultDepartementId: "7",
      defaultObservateurId: "13",
    });
    settingsRepository.getUserSettings.mock.mockImplementationOnce(() => Promise.resolve(mockResolved));
    departmentService.findDepartment.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(departmentServiceFactory.build())),
    );
    ageService.findAge.mock.mockImplementationOnce(() => Promise.resolve(ok(ageServiceFactory.build())));
    observerService.findObserver.mock.mockImplementationOnce(() => Promise.resolve(ok(observerServiceFactory.build())));
    sexService.findSex.mock.mockImplementationOnce(() => Promise.resolve(ok(sexServiceFactory.build())));
    numberEstimateService.findNumberEstimate.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(numberEstimateServiceFactory.build())),
    );

    await settingsService.getSettings(loggedUser);

    assert.strictEqual(settingsRepository.getUserSettings.mock.callCount(), 1);
    assert.deepStrictEqual(settingsRepository.getUserSettings.mock.calls[0].arguments, [loggedUser.id]);
    assert.strictEqual(departmentService.findDepartment.mock.callCount(), 1);
    assert.deepStrictEqual(departmentService.findDepartment.mock.calls[0].arguments, [7, loggedUser]);
    assert.strictEqual(observerService.findObserver.mock.callCount(), 1);
    assert.deepStrictEqual(observerService.findObserver.mock.calls[0].arguments, [13, loggedUser]);
  });

  test("should query needed parameters for user when some of them are not defined", async () => {
    const loggedUser = loggedUserFactory.build();

    const mockResolved = settingsFactory.build({
      defaultDepartementId: null,
      defaultObservateurId: null,
    });
    settingsRepository.getUserSettings.mock.mockImplementationOnce(() => Promise.resolve(mockResolved));
    ageService.findAge.mock.mockImplementationOnce(() => Promise.resolve(ok(ageServiceFactory.build())));
    sexService.findSex.mock.mockImplementationOnce(() => Promise.resolve(ok(sexServiceFactory.build())));
    numberEstimateService.findNumberEstimate.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(numberEstimateServiceFactory.build())),
    );

    await settingsService.getSettings(loggedUser);

    assert.strictEqual(settingsRepository.getUserSettings.mock.callCount(), 1);
    assert.deepStrictEqual(settingsRepository.getUserSettings.mock.calls[0].arguments, [loggedUser.id]);
    assert.strictEqual(departmentService.findDepartment.mock.callCount(), 0);
    assert.strictEqual(observerService.findObserver.mock.callCount(), 0);
  });

  test("should not be allowed when no logged user provided", async () => {
    const getSettingsResult = await settingsService.getSettings(null);

    assert.deepStrictEqual(getSettingsResult, err("notAllowed"));
    assert.strictEqual(settingsRepository.getUserSettings.mock.callCount(), 0);
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
  settingsRepository.updateUserSettings.mock.mockImplementationOnce(() => Promise.resolve(mockResolved));
  departmentService.findDepartment.mock.mockImplementationOnce(() =>
    Promise.resolve(ok(departmentServiceFactory.build())),
  );
  ageService.findAge.mock.mockImplementationOnce(() => Promise.resolve(ok(ageServiceFactory.build())));
  observerService.findObserver.mock.mockImplementationOnce(() => Promise.resolve(ok(observerServiceFactory.build())));
  sexService.findSex.mock.mockImplementationOnce(() => Promise.resolve(ok(sexServiceFactory.build())));
  numberEstimateService.findNumberEstimate.mock.mockImplementationOnce(() =>
    Promise.resolve(ok(numberEstimateServiceFactory.build())),
  );

  await settingsService.updateUserSettings(updatedAppConfiguration, loggedUser);

  assert.strictEqual(settingsRepository.updateUserSettings.mock.callCount(), 1);
  assert.deepStrictEqual(settingsRepository.updateUserSettings.mock.calls[0].arguments, [
    loggedUser.id,
    {
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
    },
  ]);
  assert.strictEqual(departmentService.findDepartment.mock.callCount(), 1);
  assert.deepStrictEqual(departmentService.findDepartment.mock.calls[0].arguments, [2, loggedUser]);
  assert.strictEqual(observerService.findObserver.mock.callCount(), 1);
  assert.deepStrictEqual(observerService.findObserver.mock.calls[0].arguments, [5, loggedUser]);
});
