import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createEstimationsNombre } from "./estimation-nombre-service";

test("should create new number estimates", async () => {
  const numberEstimatesData = [
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createEstimationsNombre(numberEstimatesData, loggedUser);

  expect(prismaMock.estimationNombre.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationNombre.createMany).toHaveBeenLastCalledWith({
    data: numberEstimatesData.map((numberEstimate) => {
      return {
        ...numberEstimate,
        ownerId: loggedUser.id
      };
    })
  });
});
