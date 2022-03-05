import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createCommunes } from "./commune-service";

test("should create new communes", async () => {
  const communesData = [
    mock<Omit<Prisma.CommuneCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.CommuneCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.CommuneCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createCommunes(communesData, loggedUser);

  expect(prismaMock.commune.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.commune.createMany).toHaveBeenLastCalledWith({
    data: communesData.map((commune) => {
      return {
        ...commune,
        ownerId: loggedUser.id
      };
    })
  });
});
