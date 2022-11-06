import { Settings } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { InputSettings } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { OucaError } from "../../utils/errors";
import { findAppConfiguration, findCoordinatesSystem, persistUserSettings } from "./configuration-service";

describe("Fetch app configuration for user", () => {
  test("should query needed parameters for user", async () => {
    const loggedUser = mock<LoggedUser>();

    await findAppConfiguration(loggedUser);

    expect(prismaMock.settings.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.settings.findUnique).toHaveBeenCalledWith({
      include: {
        defaultObservateur: true,
        defaultDepartement: true,
        defaultAge: true,
        defaultSexe: true,
        defaultEstimationNombre: true,
      },
      where: {
        userId: loggedUser.id,
      },
    });
  });

  test("should throw an error when no logged user provided", async () => {
    await expect(findAppConfiguration(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.settings.findUnique).not.toHaveBeenCalled();
  });
});

test("should query coordinates system for user", async () => {
  const settings = mock<Settings>({
    coordinatesSystem: "gps",
  });
  const loggedUser = mock<LoggedUser>();

  prismaMock.settings.findUnique.mockResolvedValueOnce(settings);

  const coordinatesSystem = await findCoordinatesSystem(loggedUser);

  expect(prismaMock.settings.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.settings.findUnique).toHaveBeenCalledWith({
    where: {
      userId: loggedUser.id,
    },
  });
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
    include: {
      defaultObservateur: true,
      defaultDepartement: true,
      defaultAge: true,
      defaultSexe: true,
      defaultEstimationNombre: true,
    },
    where: {
      userId: loggedUser.id,
    },
  });
});
