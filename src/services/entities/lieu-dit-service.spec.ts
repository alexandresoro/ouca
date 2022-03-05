import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createLieuxDits } from "./lieu-dit-service";

test("should create new lieudits", async () => {
  const lieuDitsData = [
    mock<Omit<Prisma.LieuditCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.LieuditCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.LieuditCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createLieuxDits(lieuDitsData, loggedUser);

  expect(prismaMock.lieudit.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.lieudit.createMany).toHaveBeenLastCalledWith({
    data: lieuDitsData.map((lieuDit) => {
      return {
        ...lieuDit,
        ownerId: loggedUser.id
      };
    })
  });
});
