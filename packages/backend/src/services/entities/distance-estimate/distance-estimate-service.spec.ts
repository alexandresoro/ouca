import { type LoggedUser } from "@domain/user/logged-user.js";
import { distanceEstimateFactory } from "@fixtures/domain/distance-estimate/distance-estimate.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertDistanceEstimateInputFactory } from "@fixtures/services/distance-estimate/distance-estimate-service.fixtures.js";
import { type DistanceEstimatesSearchParams } from "@ou-ca/common/api/distance-estimate";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EstimationDistanceRepository } from "../../../repositories/estimation-distance/estimation-distance-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildDistanceEstimateService } from "./distance-estimate-service.js";

const distanceEstimateRepository = mockVi<EstimationDistanceRepository>();
const entryRepository = mockVi<DonneeRepository>();

const distanceEstimateService = buildDistanceEstimateService({
  distanceEstimateRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find distance estimate", () => {
  test("should handle a matching distance estimate", async () => {
    const distanceEstimateData = distanceEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    distanceEstimateRepository.findEstimationDistanceById.mockResolvedValueOnce(distanceEstimateData);

    await distanceEstimateService.findDistanceEstimate(12, loggedUser);

    expect(distanceEstimateRepository.findEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findEstimationDistanceById).toHaveBeenLastCalledWith(12);
  });

  test("should handle distance estimate not found", async () => {
    distanceEstimateRepository.findEstimationDistanceById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(distanceEstimateService.findDistanceEstimate(10, loggedUser)).resolves.toEqual(ok(null));

    expect(distanceEstimateRepository.findEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findEstimationDistanceById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await distanceEstimateService.findDistanceEstimate(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.findEstimationDistanceById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await distanceEstimateService.getEntriesCountByDistanceEstimate("12", loggedUser);

    expect(entryRepository.getCountByEstimationDistanceId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByEstimationDistanceId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await distanceEstimateService.getEntriesCountByDistanceEstimate("12", null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Find distance estimate by data ID", () => {
  test("should handle distance estimate found", async () => {
    const distanceEstimateData = distanceEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    distanceEstimateRepository.findEstimationDistanceByDonneeId.mockResolvedValueOnce(distanceEstimateData);

    const distanceEstimateResult = await distanceEstimateService.findDistanceEstimateOfEntryId("43", loggedUser);

    expect(distanceEstimateRepository.findEstimationDistanceByDonneeId).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findEstimationDistanceByDonneeId).toHaveBeenLastCalledWith(43);
    expect(distanceEstimateResult.isOk()).toBeTruthy();
    expect(distanceEstimateResult._unsafeUnwrap()?.id).toEqual(distanceEstimateData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await distanceEstimateService.findDistanceEstimateOfEntryId("12", null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all distance estimates", async () => {
  const distanceEstimatesData = distanceEstimateFactory.buildList(3);

  distanceEstimateRepository.findEstimationsDistance.mockResolvedValueOnce(distanceEstimatesData);

  await distanceEstimateService.findAllDistanceEstimates();

  expect(distanceEstimateRepository.findEstimationsDistance).toHaveBeenCalledTimes(1);
  expect(distanceEstimateRepository.findEstimationsDistance).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const distanceEstimatesData = distanceEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    distanceEstimateRepository.findEstimationsDistance.mockResolvedValueOnce(distanceEstimatesData);

    await distanceEstimateService.findPaginatedDistanceEstimates(loggedUser, {});

    expect(distanceEstimateRepository.findEstimationsDistance).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findEstimationsDistance).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated distance estimates", async () => {
    const distanceEstimatesData = distanceEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: DistanceEstimatesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    distanceEstimateRepository.findEstimationsDistance.mockResolvedValueOnce([distanceEstimatesData[0]]);

    await distanceEstimateService.findPaginatedDistanceEstimates(loggedUser, searchParams);

    expect(distanceEstimateRepository.findEstimationsDistance).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findEstimationsDistance).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await distanceEstimateService.findPaginatedDistanceEstimates(null, {});

    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await distanceEstimateService.getDistanceEstimatesCount(loggedUser);

    expect(distanceEstimateRepository.getCount).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await distanceEstimateService.getDistanceEstimatesCount(loggedUser, "test");

    expect(distanceEstimateRepository.getCount).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await distanceEstimateService.getDistanceEstimatesCount(null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of a distance estimate", () => {
  test("should be allowed when requested by an admin", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    expect(distanceEstimateRepository.updateEstimationDistance).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.updateEstimationDistance).toHaveBeenLastCalledWith(12, distanceEstimateData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = distanceEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    distanceEstimateRepository.findEstimationDistanceById.mockResolvedValueOnce(existingData);

    await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    expect(distanceEstimateRepository.updateEstimationDistance).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.updateEstimationDistance).toHaveBeenLastCalledWith(12, distanceEstimateData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = distanceEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    distanceEstimateRepository.findEstimationDistanceById.mockResolvedValueOnce(existingData);

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.updateEstimationDistance).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a distance estimate that exists", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    distanceEstimateRepository.updateEstimationDistance.mockImplementation(uniqueConstraintFailed);

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(distanceEstimateRepository.updateEstimationDistance).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.updateEstimationDistance).toHaveBeenLastCalledWith(12, distanceEstimateData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.updateEstimationDistance).not.toHaveBeenCalled();
  });
});

describe("Creation of a distance estimate", () => {
  test("should create new distance estimate", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await distanceEstimateService.createDistanceEstimate(distanceEstimateData, loggedUser);

    expect(distanceEstimateRepository.createEstimationDistance).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.createEstimationDistance).toHaveBeenLastCalledWith({
      ...distanceEstimateData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a distance estimate that already exists", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    distanceEstimateRepository.createEstimationDistance.mockImplementation(uniqueConstraintFailed);

    const createResult = await distanceEstimateService.createDistanceEstimate(distanceEstimateData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(distanceEstimateRepository.createEstimationDistance).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.createEstimationDistance).toHaveBeenLastCalledWith({
      ...distanceEstimateData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const createResult = await distanceEstimateService.createDistanceEstimate(distanceEstimateData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.createEstimationDistance).not.toHaveBeenCalled();
  });
});

describe("Deletion of a distance estimate", () => {
  test("should handle the deletion of an owned distance estimate", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const distanceEstimate = distanceEstimateFactory.build({
      ownerId: loggedUser.id,
    });

    distanceEstimateRepository.findEstimationDistanceById.mockResolvedValueOnce(distanceEstimate);

    await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    expect(distanceEstimateRepository.deleteEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.deleteEstimationDistanceById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any distance estimate if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    distanceEstimateRepository.findEstimationDistanceById.mockResolvedValueOnce(distanceEstimateFactory.build());

    await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    expect(distanceEstimateRepository.deleteEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.deleteEstimationDistanceById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned distance estimate as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    distanceEstimateRepository.findEstimationDistanceById.mockResolvedValueOnce(distanceEstimateFactory.build());

    const deleteResult = await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.deleteEstimationDistanceById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await distanceEstimateService.deleteDistanceEstimate(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.deleteEstimationDistanceById).not.toHaveBeenCalled();
  });
});

test("Create multiple distance estimates", async () => {
  const distanceEstimatesData = upsertDistanceEstimateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  distanceEstimateRepository.createEstimationsDistance.mockResolvedValueOnce([]);

  await distanceEstimateService.createDistanceEstimates(distanceEstimatesData, loggedUser);

  expect(distanceEstimateRepository.createEstimationsDistance).toHaveBeenCalledTimes(1);
  expect(distanceEstimateRepository.createEstimationsDistance).toHaveBeenLastCalledWith(
    distanceEstimatesData.map((distanceEstimate) => {
      return {
        ...distanceEstimate,
        owner_id: loggedUser.id,
      };
    })
  );
});
