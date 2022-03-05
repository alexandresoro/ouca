import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createMilieux } from "./milieu-service";

test("should create new environments", async () => {
  const environmentsData = [
    mock<Omit<Prisma.MilieuCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MilieuCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.MilieuCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createMilieux(environmentsData, loggedUser);

  expect(prismaMock.milieu.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.milieu.createMany).toHaveBeenLastCalledWith({
    data: environmentsData.map((environment) => {
      return {
        ...environment,
        ownerId: loggedUser.id
      };
    })
  });
});
