import { DatabaseRole } from "@prisma/client";
import { InputSettings } from "../../model/graphql";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { OucaError } from "../../utils/errors";
import { createInitialUserSettings, findAppConfiguration, persistUserSettings } from "./configuration-service";

test("should query needed parameters for user", async () => {
  const loggedUser: LoggedUser = {
    id: "11",
    role: DatabaseRole.contributor
  };

  await findAppConfiguration(loggedUser);

  expect(prismaMock.settings.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.settings.findUnique).toHaveBeenCalledWith({
    include: {
      defaultObservateur: true,
      defaultDepartement: true,
      defaultAge: true,
      defaultSexe: true,
      defaultEstimationNombre: true
    },
    where: {
      userId: loggedUser.id
    }
  });
});

test("should create settings for a user", async () => {
  prismaMock.settings.findFirst.mockResolvedValueOnce(null);

  await createInitialUserSettings("12");

  expect(prismaMock.settings.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.settings.create).toHaveBeenCalledWith({
    data: {
      userId: "12"
    }
  });
});

test("should throw an error when creating settings for a user that already has settings", async () => {
  prismaMock.settings.findFirst.mockResolvedValueOnce({
    areAssociesDisplayed: true,
    coordinatesSystem: "gps",
    defaultAgeId: 1,
    defaultDepartementId: 2,
    defaultEstimationNombreId: 3,
    defaultNombre: 4,
    defaultObservateurId: 5,
    defaultSexeId: 6,
    id: 7,
    isDistanceDisplayed: true,
    isMeteoDisplayed: true,
    isRegroupementDisplayed: true,
    userId: "11"
  });

  await expect(() => createInitialUserSettings("12")).rejects.toThrowError(new OucaError("OUCA0005"));

  expect(prismaMock.settings.create).toHaveBeenCalledTimes(0);
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
    isRegroupementDisplayed: true
  };

  const loggedUser: LoggedUser = {
    id: "11",
    role: DatabaseRole.contributor
  };

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
      isRegroupementDisplayed: true
    },
    include: {
      defaultObservateur: true,
      defaultDepartement: true,
      defaultAge: true,
      defaultSexe: true,
      defaultEstimationNombre: true
    },
    where: {
      id: 7,
      userId: loggedUser.id
    }
  });
});
