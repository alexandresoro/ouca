import { type PutSettingsInput } from "@ou-ca/common/api/settings.js";
import { type Logger } from "pino";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DepartementRepository } from "../repositories/departement/departement-repository.js";
import { type ObservateurRepository } from "../repositories/observateur/observateur-repository.js";
import { type Settings } from "../repositories/settings/settings-repository-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";
import { buildSettingsService } from "./settings-service.js";

const settingsRepository = mock<SettingsRepository>({
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
});
const departementRepository = mock<DepartementRepository>({});
const observateurRepository = mock<ObservateurRepository>({});

const logger = mock<Logger>();

const settingsService = buildSettingsService({
  logger,
  settingsRepository,
  departementRepository,
  observateurRepository,
});

describe("Fetch app configuration for user", () => {
  test("should query needed parameters for user", async () => {
    const loggedUser = mock<LoggedUser>();

    const mockResolved = mock<Settings>({
      defaultDepartementId: 7,
      defaultObservateurId: 13,
    });
    settingsRepository.getUserSettings.mockResolvedValueOnce(mockResolved);

    await settingsService.getSettings(loggedUser);

    expect(settingsRepository.getUserSettings).toHaveBeenCalledTimes(1);
    expect(settingsRepository.getUserSettings).toHaveBeenCalledWith(loggedUser.id);
    expect(departementRepository.findDepartementById).toHaveBeenCalledTimes(1);
    expect(departementRepository.findDepartementById).toHaveBeenCalledWith(7);
    expect(observateurRepository.findObservateurById).toHaveBeenCalledTimes(1);
    expect(observateurRepository.findObservateurById).toHaveBeenCalledWith(13);
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
    expect(departementRepository.findDepartementById).not.toHaveBeenCalled();
    expect(observateurRepository.findObservateurById).not.toHaveBeenCalled();
  });

  test("should throw an error when no logged user provided", async () => {
    await expect(settingsService.getSettings(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(settingsRepository.getUserSettings).not.toHaveBeenCalled();
  });
});

test("should query coordinates system for user", async () => {
  const settings = mock<Settings>({
    coordinatesSystem: "gps",
  });
  const loggedUser = mock<LoggedUser>();

  settingsRepository.getUserSettings.mockResolvedValueOnce(settings);

  const coordinatesSystem = await settingsService.findCoordinatesSystem(loggedUser);

  expect(settingsRepository.getUserSettings).toHaveBeenCalledTimes(1);
  expect(settingsRepository.getUserSettings).toHaveBeenCalledWith(loggedUser.id);
  expect(coordinatesSystem).toEqual(settings.coordinatesSystem);
});

test("should update settings with parameters  for user", async () => {
  const updatedAppConfiguration = {
    areAssociesDisplayed: true,
    coordinatesSystem: "gps",
    defaultAge: 1,
    defaultDepartment: "2",
    defaultEstimationNombre: 3,
    defaultNombre: 4,
    defaultObserver: "5",
    defaultSexe: 6,
    isDistanceDisplayed: true,
    isMeteoDisplayed: true,
    isRegroupementDisplayed: true,
  } satisfies PutSettingsInput;

  const loggedUser = mock<LoggedUser>();

  const mockResolved = mock<Settings>({
    defaultDepartementId: 2,
    defaultObservateurId: 5,
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
  expect(departementRepository.findDepartementById).toHaveBeenCalledTimes(1);
  expect(departementRepository.findDepartementById).toHaveBeenCalledWith(2);
  expect(observateurRepository.findObservateurById).toHaveBeenCalledTimes(1);
  expect(observateurRepository.findObservateurById).toHaveBeenCalledWith(5);
});
