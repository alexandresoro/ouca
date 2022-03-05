import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createMeteos } from "./meteo-service";

test("should create new weathers", async () => {
  const weathersData = [
    mock<Omit<Prisma.MeteoCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MeteoCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MeteoCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createMeteos(weathersData, loggedUser);

  expect(prismaMock.meteo.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.meteo.createMany).toHaveBeenLastCalledWith({
    data: weathersData.map((weather) => {
      return {
        ...weather,
        ownerId: loggedUser.id
      };
    })
  });
});
