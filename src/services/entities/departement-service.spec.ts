import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createDepartements } from "./departement-service";

test("should create new departments", async () => {
  const departmentsData = [
    mock<Omit<Prisma.DepartementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.DepartementCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.DepartementCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createDepartements(departmentsData, loggedUser);

  expect(prismaMock.departement.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.departement.createMany).toHaveBeenLastCalledWith({
    data: departmentsData.map((department) => {
      return {
        ...department,
        ownerId: loggedUser.id
      };
    })
  });
});
