import { OucaError } from "@domain/errors/ouca-error.js";
import { type Settings } from "@domain/settings/settings.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type SettingsRepository } from "@interfaces/settings-repository-interface.js";
import { type PutSettingsInput } from "@ou-ca/common/api/settings";
import { type Logger } from "pino";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type AgeService } from "../../../services/entities/age-service.js";
import { type DepartementService } from "../../../services/entities/departement-service.js";
import { type EstimationNombreService } from "../../../services/entities/estimation-nombre-service.js";
import { type ObservateurService } from "../../../services/entities/observateur-service.js";
import { type SexeService } from "../../../services/entities/sexe-service.js";
import { buildSettingsService } from "./settings-service.js";

const settingsRepository = mock<SettingsRepository>({
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
});
const departementService = mock<DepartementService>({
  findDepartement: vi.fn(),
});
const observateurService = mock<ObservateurService>({
  findObservateur: vi.fn(),
});

const sexeService = mock<SexeService>({
  findSexe: vi.fn(),
});

const ageService = mock<AgeService>({
  findAge: vi.fn(),
});

const estimationNombreService = mock<EstimationNombreService>({
  findEstimationNombre: vi.fn(),
});

const logger = mock<Logger>();

const settingsService = buildSettingsService({
  logger,
  settingsRepository,
  departementService,
  observateurService,
  sexeService,
  ageService,
  estimationNombreService,
});

describe("Fetch app configuration for user", () => {
  test("should query needed parameters for user", async () => {
    const loggedUser = mock<LoggedUser>();

    const mockResolved = mock<Settings>({
      defaultDepartementId: "7",
      defaultObservateurId: "13",
    });
    settingsRepository.getUserSettings.mockResolvedValueOnce(mockResolved);

    await settingsService.getSettings(loggedUser);

    expect(settingsRepository.getUserSettings).toHaveBeenCalledTimes(1);
    expect(settingsRepository.getUserSettings).toHaveBeenCalledWith(loggedUser.id);
    expect(departementService.findDepartement).toHaveBeenCalledTimes(1);
    expect(departementService.findDepartement).toHaveBeenCalledWith(7, loggedUser);
    expect(observateurService.findObservateur).toHaveBeenCalledTimes(1);
    expect(observateurService.findObservateur).toHaveBeenCalledWith(13, loggedUser);
  });

  test("should query needed parameters for user when some of them are not defined", async () => {
    const loggedUser = mock<LoggedUser>();

    const mockResolved = mock<Settings>({
      defaultDepartementId: null,
      defaultObservateurId: null,
    });
    settingsRepository.getUserSettings.mockResolvedValueOnce(mockResolved);

    await settingsService.getSettings(loggedUser);

    expect(settingsRepository.getUserSettings).toHaveBeenCalledTimes(1);
    expect(settingsRepository.getUserSettings).toHaveBeenCalledWith(loggedUser.id);
    expect(departementService.findDepartement).not.toHaveBeenCalled();
    expect(observateurService.findObservateur).not.toHaveBeenCalled();
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

  const loggedUser = mock<LoggedUser>();

  const mockResolved = mock<Settings>({
    defaultDepartementId: "2",
    defaultObservateurId: "5",
  });
  settingsRepository.updateUserSettings.mockResolvedValueOnce(mockResolved);

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
  expect(departementService.findDepartement).toHaveBeenCalledTimes(1);
  expect(departementService.findDepartement).toHaveBeenCalledWith(2, loggedUser);
  expect(observateurService.findObservateur).toHaveBeenCalledTimes(1);
  expect(observateurService.findObservateur).toHaveBeenCalledWith(5, loggedUser);
});
