import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createEspeces } from "./espece-service";

test("should create new species", async () => {
  const speciesData = [
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createEspeces(speciesData, loggedUser);

  expect(prismaMock.espece.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.createMany).toHaveBeenLastCalledWith({
    data: speciesData.map((species) => {
      return {
        ...species,
        ownerId: loggedUser.id
      };
    })
  });
});
