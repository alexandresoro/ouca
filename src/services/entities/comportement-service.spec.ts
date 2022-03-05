import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createComportements } from "./comportement-service";

test("should create new comportements", async () => {
  const comportementsData = [
    mock<Omit<Prisma.ComportementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ComportementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ComportementCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createComportements(comportementsData, loggedUser);

  expect(prismaMock.comportement.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.comportement.createMany).toHaveBeenLastCalledWith({
    data: comportementsData.map((comportement) => {
      return {
        ...comportement,
        ownerId: loggedUser.id
      };
    })
  });
});
