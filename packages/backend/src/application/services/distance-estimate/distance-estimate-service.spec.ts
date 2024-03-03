import { type LoggedUser } from "@domain/user/logged-user.js";
import { distanceEstimateFactory } from "@fixtures/domain/distance-estimate/distance-estimate.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertDistanceEstimateInputFactory } from "@fixtures/services/distance-estimate/distance-estimate-service.fixtures.js";
import { type DistanceEstimateRepository } from "@interfaces/distance-estimate-repository-interface.js";
import { type DistanceEstimatesSearchParams } from "@ou-ca/common/api/distance-estimate";
import { err, ok } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildDistanceEstimateService } from "./distance-estimate-service.js";

const distanceEstimateRepository = mockVi<DistanceEstimateRepository>();
const entryRepository = mockVi<DonneeRepository>();

const distanceEstimateService = buildDistanceEstimateService({
  distanceEstimateRepository,
  entryRepository,
});

describe("Find distance estimate", () => {
  test("should handle a matching distance estimate", async () => {
    const distanceEstimateData = distanceEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    distanceEstimateRepository.findDistanceEstimateById.mockResolvedValueOnce(distanceEstimateData);

    await distanceEstimateService.findDistanceEstimate(12, loggedUser);

    expect(distanceEstimateRepository.findDistanceEstimateById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findDistanceEstimateById).toHaveBeenLastCalledWith(12);
  });

  test("should handle distance estimate not found", async () => {
    distanceEstimateRepository.findDistanceEstimateById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(distanceEstimateService.findDistanceEstimate(10, loggedUser)).resolves.toEqual(ok(null));

    expect(distanceEstimateRepository.findDistanceEstimateById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findDistanceEstimateById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await distanceEstimateService.findDistanceEstimate(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.findDistanceEstimateById).not.toHaveBeenCalled();
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

    distanceEstimateRepository.findDistanceEstimateByEntryId.mockResolvedValueOnce(distanceEstimateData);

    const distanceEstimateResult = await distanceEstimateService.findDistanceEstimateOfEntryId("43", loggedUser);

    expect(distanceEstimateRepository.findDistanceEstimateByEntryId).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findDistanceEstimateByEntryId).toHaveBeenLastCalledWith(43);
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

  distanceEstimateRepository.findDistanceEstimates.mockResolvedValueOnce(distanceEstimatesData);

  await distanceEstimateService.findAllDistanceEstimates();

  expect(distanceEstimateRepository.findDistanceEstimates).toHaveBeenCalledTimes(1);
  expect(distanceEstimateRepository.findDistanceEstimates).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const distanceEstimatesData = distanceEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    distanceEstimateRepository.findDistanceEstimates.mockResolvedValueOnce(distanceEstimatesData);

    await distanceEstimateService.findPaginatedDistanceEstimates(loggedUser, {});

    expect(distanceEstimateRepository.findDistanceEstimates).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findDistanceEstimates).toHaveBeenLastCalledWith({});
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

    distanceEstimateRepository.findDistanceEstimates.mockResolvedValueOnce([distanceEstimatesData[0]]);

    await distanceEstimateService.findPaginatedDistanceEstimates(loggedUser, searchParams);

    expect(distanceEstimateRepository.findDistanceEstimates).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.findDistanceEstimates).toHaveBeenLastCalledWith({
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

    distanceEstimateRepository.updateDistanceEstimate.mockResolvedValueOnce(ok(distanceEstimateFactory.build()));

    await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    expect(distanceEstimateRepository.updateDistanceEstimate).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.updateDistanceEstimate).toHaveBeenLastCalledWith(12, distanceEstimateData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = distanceEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    distanceEstimateRepository.findDistanceEstimateById.mockResolvedValueOnce(existingData);
    distanceEstimateRepository.updateDistanceEstimate.mockResolvedValueOnce(ok(distanceEstimateFactory.build()));

    await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    expect(distanceEstimateRepository.updateDistanceEstimate).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.updateDistanceEstimate).toHaveBeenLastCalledWith(12, distanceEstimateData);
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

    distanceEstimateRepository.findDistanceEstimateById.mockResolvedValueOnce(existingData);

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.updateDistanceEstimate).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a distance estimate that exists", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    distanceEstimateRepository.updateDistanceEstimate.mockResolvedValueOnce(err("alreadyExists"));

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(distanceEstimateRepository.updateDistanceEstimate).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.updateDistanceEstimate).toHaveBeenLastCalledWith(12, distanceEstimateData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.updateDistanceEstimate).not.toHaveBeenCalled();
  });
});

describe("Creation of a distance estimate", () => {
  test("should create new distance estimate", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    distanceEstimateRepository.createDistanceEstimate.mockResolvedValueOnce(ok(distanceEstimateFactory.build()));

    await distanceEstimateService.createDistanceEstimate(distanceEstimateData, loggedUser);

    expect(distanceEstimateRepository.createDistanceEstimate).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.createDistanceEstimate).toHaveBeenLastCalledWith({
      ...distanceEstimateData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a distance estimate that already exists", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    distanceEstimateRepository.createDistanceEstimate.mockResolvedValueOnce(err("alreadyExists"));

    const createResult = await distanceEstimateService.createDistanceEstimate(distanceEstimateData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(distanceEstimateRepository.createDistanceEstimate).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.createDistanceEstimate).toHaveBeenLastCalledWith({
      ...distanceEstimateData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const createResult = await distanceEstimateService.createDistanceEstimate(distanceEstimateData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.createDistanceEstimate).not.toHaveBeenCalled();
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

    distanceEstimateRepository.findDistanceEstimateById.mockResolvedValueOnce(distanceEstimate);

    await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    expect(distanceEstimateRepository.deleteDistanceEstimateById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.deleteDistanceEstimateById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any distance estimate if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    distanceEstimateRepository.findDistanceEstimateById.mockResolvedValueOnce(distanceEstimateFactory.build());

    await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    expect(distanceEstimateRepository.deleteDistanceEstimateById).toHaveBeenCalledTimes(1);
    expect(distanceEstimateRepository.deleteDistanceEstimateById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned distance estimate as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    distanceEstimateRepository.findDistanceEstimateById.mockResolvedValueOnce(distanceEstimateFactory.build());

    const deleteResult = await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.deleteDistanceEstimateById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await distanceEstimateService.deleteDistanceEstimate(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(distanceEstimateRepository.deleteDistanceEstimateById).not.toHaveBeenCalled();
  });
});

test("Create multiple distance estimates", async () => {
  const distanceEstimatesData = upsertDistanceEstimateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  distanceEstimateRepository.createDistanceEstimates.mockResolvedValueOnce([]);

  await distanceEstimateService.createDistanceEstimates(distanceEstimatesData, loggedUser);

  expect(distanceEstimateRepository.createDistanceEstimates).toHaveBeenCalledTimes(1);
  expect(distanceEstimateRepository.createDistanceEstimates).toHaveBeenLastCalledWith(
    distanceEstimatesData.map((distanceEstimate) => {
      return {
        ...distanceEstimate,
        ownerId: loggedUser.id,
      };
    })
  );
});
