import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { createEstimationsDistance } from "./estimation-distance-service";

test("should create new distance estimates", async () => {
  const distanceEstimatesData = [
    mock<Omit<Prisma.EstimationDistanceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationDistanceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EstimationDistanceCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createEstimationsDistance(distanceEstimatesData, loggedUser);

  expect(prismaMock.estimationDistance.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.estimationDistance.createMany).toHaveBeenLastCalledWith({
    data: distanceEstimatesData.map((distanceEstimate) => {
      return {
        ...distanceEstimate,
        ownerId: loggedUser.id
      };
    })
  });
});
