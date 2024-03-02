import {
  numberEstimateCreateInputFactory,
  numberEstimateFactory,
} from "@fixtures/domain/number-estimate/number-estimate.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertNumberEstimateInputFactory } from "@fixtures/services/number-estimate/number-estimate-service.fixtures.js";
import { type NumberEstimateRepository } from "@interfaces/number-estimate-repository-interface.js";
import { type NumberEstimatesSearchParams } from "@ou-ca/common/api/number-estimate";
import { err, ok } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildNumberEstimateService } from "./number-estimate-service.js";

const numberEstimateRepository = mockVi<NumberEstimateRepository>();
const entryRepository = mockVi<DonneeRepository>();

const numberEstimateService = buildNumberEstimateService({
  numberEstimateRepository,
  entryRepository,
});

describe("Find number estimate", () => {
  test("should handle a matching number estimate", async () => {
    const numberEstimateData = numberEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findNumberEstimateById.mockResolvedValueOnce(numberEstimateData);

    await numberEstimateService.findNumberEstimate(12, loggedUser);

    expect(numberEstimateRepository.findNumberEstimateById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findNumberEstimateById).toHaveBeenLastCalledWith(12);
  });

  test("should handle number estimate not found", async () => {
    numberEstimateRepository.findNumberEstimateById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(numberEstimateService.findNumberEstimate(10, loggedUser)).resolves.toEqual(ok(null));

    expect(numberEstimateRepository.findNumberEstimateById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findNumberEstimateById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await numberEstimateService.findNumberEstimate(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(numberEstimateRepository.findNumberEstimateById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getEntriesCountByNumberEstimate("12", loggedUser);

    expect(entryRepository.getCountByEstimationNombreId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByEstimationNombreId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await numberEstimateService.getEntriesCountByNumberEstimate("12", null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Find number estimate by data ID", () => {
  test("should handle number estimate found", async () => {
    const numberEstimateData = numberEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findNumberEstimateByEntryId.mockResolvedValueOnce(numberEstimateData);

    const numberEstimateResult = await numberEstimateService.findNumberEstimateOfEntryId("43", loggedUser);

    expect(numberEstimateRepository.findNumberEstimateByEntryId).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findNumberEstimateByEntryId).toHaveBeenLastCalledWith(43);
    expect(numberEstimateResult.isOk()).toBeTruthy();
    expect(numberEstimateResult._unsafeUnwrap()?.id).toEqual(numberEstimateData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await numberEstimateService.findNumberEstimateOfEntryId("12", null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all number estimates", async () => {
  const numberEstimatesData = numberEstimateFactory.buildList(3);

  numberEstimateRepository.findNumberEstimates.mockResolvedValueOnce(numberEstimatesData);

  await numberEstimateService.findAllNumberEstimates();

  expect(numberEstimateRepository.findNumberEstimates).toHaveBeenCalledTimes(1);
  expect(numberEstimateRepository.findNumberEstimates).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const numberEstimatesData = numberEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findNumberEstimates.mockResolvedValueOnce(numberEstimatesData);

    await numberEstimateService.findPaginatesNumberEstimates(loggedUser, {});

    expect(numberEstimateRepository.findNumberEstimates).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findNumberEstimates).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated number estimates", async () => {
    const numberEstimatesData = numberEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: NumberEstimatesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    numberEstimateRepository.findNumberEstimates.mockResolvedValueOnce([numberEstimatesData[0]]);

    await numberEstimateService.findPaginatesNumberEstimates(loggedUser, searchParams);

    expect(numberEstimateRepository.findNumberEstimates).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findNumberEstimates).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await numberEstimateService.findPaginatesNumberEstimates(null, {});

    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getNumberEstimatesCount(loggedUser);

    expect(numberEstimateRepository.getCount).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getNumberEstimatesCount(loggedUser, "test");

    expect(numberEstimateRepository.getCount).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await numberEstimateService.getNumberEstimatesCount(null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of a number estimate", () => {
  test("should be allowed when requested by an admin", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    numberEstimateRepository.updateNumberEstimate.mockResolvedValueOnce(ok(numberEstimateFactory.build()));

    await numberEstimateService.updateNumberEstimate(12, numberEstimateData, loggedUser);

    expect(numberEstimateRepository.updateNumberEstimate).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.updateNumberEstimate).toHaveBeenLastCalledWith(12, numberEstimateData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = numberEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    numberEstimateRepository.findNumberEstimateById.mockResolvedValueOnce(existingData);
    numberEstimateRepository.updateNumberEstimate.mockResolvedValueOnce(ok(numberEstimateFactory.build()));

    await numberEstimateService.updateNumberEstimate(12, numberEstimateData, loggedUser);

    expect(numberEstimateRepository.updateNumberEstimate).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.updateNumberEstimate).toHaveBeenLastCalledWith(12, numberEstimateData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = numberEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    numberEstimateRepository.findNumberEstimateById.mockResolvedValueOnce(existingData);

    const updateResult = await numberEstimateService.updateNumberEstimate(12, numberEstimateData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(numberEstimateRepository.updateNumberEstimate).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a number estimate that exists", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    numberEstimateRepository.updateNumberEstimate.mockResolvedValueOnce(err("alreadyExists"));

    const updateResult = await numberEstimateService.updateNumberEstimate(12, numberEstimateData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(numberEstimateRepository.updateNumberEstimate).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.updateNumberEstimate).toHaveBeenLastCalledWith(12, numberEstimateData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const updateResult = await numberEstimateService.updateNumberEstimate(12, numberEstimateData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(numberEstimateRepository.updateNumberEstimate).not.toHaveBeenCalled();
  });
});

describe("Creation of a number estimate", () => {
  test("should create new number estimate", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    numberEstimateRepository.createNumberEstimate.mockResolvedValueOnce(ok(numberEstimateFactory.build()));

    await numberEstimateService.createNumberEstimate(numberEstimateData, loggedUser);

    expect(numberEstimateRepository.createNumberEstimate).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.createNumberEstimate).toHaveBeenLastCalledWith({
      ...numberEstimateData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a number estimate that already exists", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    numberEstimateRepository.createNumberEstimate.mockResolvedValueOnce(err("alreadyExists"));

    const createResult = await numberEstimateService.createNumberEstimate(numberEstimateData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(numberEstimateRepository.createNumberEstimate).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.createNumberEstimate).toHaveBeenLastCalledWith({
      ...numberEstimateData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const createResult = await numberEstimateService.createNumberEstimate(numberEstimateData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(numberEstimateRepository.createNumberEstimate).not.toHaveBeenCalled();
  });
});

describe("Deletion of a number estimate", () => {
  test("should handle the deletion of an owned number estimate", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const numberEstimate = numberEstimateFactory.build({
      ownerId: loggedUser.id,
    });

    numberEstimateRepository.findNumberEstimateById.mockResolvedValueOnce(numberEstimate);

    await numberEstimateService.deleteNumberEstimate(11, loggedUser);

    expect(numberEstimateRepository.deleteNumberEstimateById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.deleteNumberEstimateById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any number estimate if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    numberEstimateRepository.findNumberEstimateById.mockResolvedValueOnce(numberEstimateFactory.build());

    await numberEstimateService.deleteNumberEstimate(11, loggedUser);

    expect(numberEstimateRepository.deleteNumberEstimateById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.deleteNumberEstimateById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned number estimate as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    numberEstimateRepository.findNumberEstimateById.mockResolvedValueOnce(numberEstimateFactory.build());

    const deleteResult = await numberEstimateService.deleteNumberEstimate(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(numberEstimateRepository.deleteNumberEstimateById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await numberEstimateService.deleteNumberEstimate(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(numberEstimateRepository.deleteNumberEstimateById).not.toHaveBeenCalled();
  });
});

test("Create multiple number estimates", async () => {
  const numberEstimatesData = numberEstimateCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  numberEstimateRepository.createNumberEstimates.mockResolvedValueOnce([]);

  await numberEstimateService.createNumberEstimates(numberEstimatesData, loggedUser);

  expect(numberEstimateRepository.createNumberEstimates).toHaveBeenCalledTimes(1);
  expect(numberEstimateRepository.createNumberEstimates).toHaveBeenLastCalledWith(
    numberEstimatesData.map((numberEstimate) => {
      return {
        ...numberEstimate,
        ownerId: loggedUser.id,
      };
    })
  );
});
