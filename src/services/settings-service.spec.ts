import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { type InputSettings } from "../graphql/generated/graphql-types";
import { type SettingsRepository } from "../repositories/settings/settings-repository";
import { type Settings } from "../repositories/settings/settings-repository-types";
import { prismaMock } from "../sql/prisma-mock";
import { type LoggedUser } from "../types/User";
import { OucaError } from "../utils/errors";
import { buildSettingsService, persistUserSettings } from "./settings-service";

const settingsRepository = mock<SettingsRepository>({
  getUserSettings: jest.fn(),
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

  await persistUserSettings(updatedAppConfiguration, loggedUser);

  expect(prismaMock.settings.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.settings.update).toHaveBeenCalledWith({
    data: {
      areAssociesDisplayed: true,
      coordinatesSystem: "gps",
      defaultAgeId: 1,
      defaultDepartementId: 2,
      defaultEstimationNombreId: 3,
      defaultNombre: 4,
      defaultObservateurId: 5,
      defaultSexeId: 6,
      isDistanceDisplayed: true,
      isMeteoDisplayed: true,
      isRegroupementDisplayed: true,
    },
    where: {
      userId: loggedUser.id,
    },
  });
});
