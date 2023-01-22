import { type Logger } from "pino";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type InputSettings } from "../graphql/generated/graphql-types.js";
import { type Settings } from "../repositories/settings/settings-repository-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";
import { buildSettingsService } from "./settings-service.js";

const settingsRepository = mock<SettingsRepository>({
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
});
const logger = mock<Logger>();

const settingsService = buildSettingsService({
  logger,
  settingsRepository,
});

describe("Fetch app configuration for user", () => {
  test("should query needed parameters for user", async () => {
    const loggedUser = mock<LoggedUser>();

    await settingsService.findAppConfiguration(loggedUser);

    expect(settingsRepository.getUserSettings).toHaveBeenCalledTimes(1);
    expect(settingsRepository.getUserSettings).toHaveBeenCalledWith(loggedUser.id);
  });

  test("should throw an error when no logged user provided", async () => {
    await expect(settingsService.findAppConfiguration(null)).rejects.toEqual(new OucaError("OUCA0001"));
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
  const updatedAppConfiguration: InputSettings = {
    areAssociesDisplayed: true,
    coordinatesSystem: "gps",
    defaultAge: 1,
    defaultDepartement: 2,
    defaultEstimationNombre: 3,
    defaultNombre: 4,
    defaultObservateur: 5,
    defaultSexe: 6,
    id: 7,
    isDistanceDisplayed: true,
    isMeteoDisplayed: true,
    isRegroupementDisplayed: true,
  };

  const loggedUser = mock<LoggedUser>();

  await settingsService.persistUserSettings(updatedAppConfiguration, loggedUser);

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
});
