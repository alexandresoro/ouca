import { type PutSettingsInput } from "@ou-ca/common/api/settings";
import { type Logger } from "pino";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type Settings } from "../repositories/settings/settings-repository-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";
import { type DepartementService } from "./entities/departement-service.js";
import { type ObservateurService } from "./entities/observateur-service.js";
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

const logger = mock<Logger>();

const settingsService = buildSettingsService({
  logger,
  settingsRepository,
  departementService,
  observateurService,
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

test("should update settings with parameters  for user", async () => {
  const updatedAppConfiguration = {
    areAssociesDisplayed: true,
    coordinatesSystem: "gps",
    defaultAge: "1",
    defaultDepartment: "2",
    defaultEstimationNombre: "3",
    defaultNombre: 4,
    defaultObserver: "5",
    defaultSexe: "6",
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
    are_associes_displayed: true,
    coordinates_system: "gps",
    default_age_id: 1,
    default_departement_id: 2,
    default_estimation_nombre_id: 3,
    default_nombre: 4,
    default_observateur_id: 5,
    default_sexe_id: 6,
    is_distance_displayed: true,
    is_meteo_displayed: true,
    is_regroupement_displayed: true,
  });
  expect(departementService.findDepartement).toHaveBeenCalledTimes(1);
  expect(departementService.findDepartement).toHaveBeenCalledWith(2, loggedUser);
  expect(observateurService.findObservateur).toHaveBeenCalledTimes(1);
  expect(observateurService.findObservateur).toHaveBeenCalledWith(5, loggedUser);
});
