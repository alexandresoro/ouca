import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { speciesClassFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { speciesCreateInputFactory, speciesFactory } from "@fixtures/domain/species/species.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSpeciesInputFactory } from "@fixtures/services/species/species-service.fixtures.js";
import type { SpeciesRepository } from "@interfaces/species-repository-interface.js";
import type { SpeciesSearchParams } from "@ou-ca/common/api/species";
import { err, ok } from "neverthrow";
import type { SpeciesClassService } from "../../../application/services/species-class/species-class-service.js";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { EspeceRepository } from "../../../repositories/espece/espece-repository.js";
import { mock } from "../../../utils/mock.js";
import { buildSpeciesService } from "./species-service.js";

const classService = mock<SpeciesClassService>();
const speciesRepository = mock<SpeciesRepository>();
const speciesRepositoryLegacy = mock<EspeceRepository>();
const entryRepository = mock<DonneeRepository>();

const speciesService = buildSpeciesService({
  classService,
  speciesRepository,
  speciesRepositoryLegacy,
  entryRepository,
});

beforeEach(() => {
  speciesRepository.findSpeciesById.mock.resetCalls();
  speciesRepository.findSpeciesByEntryId.mock.resetCalls();
  speciesRepositoryLegacy.findEspeces.mock.resetCalls();
  speciesRepository.updateSpecies.mock.resetCalls();
  speciesRepository.createSpecies.mock.resetCalls();
  speciesRepository.deleteSpeciesById.mock.resetCalls();
  speciesRepository.createSpeciesMultiple.mock.resetCalls();
  speciesRepositoryLegacy.getCount.mock.resetCalls();
  entryRepository.getCountByEspeceId.mock.resetCalls();
  classService.findSpeciesClassOfSpecies.mock.resetCalls();
});

describe("Find species", () => {
  test("should handle a matching species", async () => {
    const speciesData = speciesFactory.build();
    const loggedUser = loggedUserFactory.build();

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpeciesById.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

    await speciesService.findSpecies(12, loggedUser);

    assert.strictEqual(speciesRepository.findSpeciesById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findSpeciesById.mock.calls[0].arguments, [12]);
  });

  test("should handle species not found", async () => {
    speciesRepository.findSpeciesById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await speciesService.findSpecies(10, loggedUser), ok(null));

    assert.strictEqual(speciesRepository.findSpeciesById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findSpeciesById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await speciesService.findSpecies(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.findSpeciesById.mock.callCount(), 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEntriesCountBySpecies("12", {}, loggedUser);

    assert.strictEqual(entryRepository.getCountByEspeceId.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCountByEspeceId.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesService.getEntriesCountBySpecies("12", {}, null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
    assert.strictEqual(entryRepository.getCountByEspeceId.mock.callCount(), 0);
  });
});

describe("Find species by data ID", () => {
  test("should handle species found", async () => {
    const speciesData = speciesFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpeciesByEntryId.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

    const speciesResult = await speciesService.findSpeciesOfEntryId("43", loggedUser);

    assert.strictEqual(speciesRepository.findSpeciesByEntryId.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findSpeciesByEntryId.mock.calls[0].arguments, ["43"]);
    assert.ok(speciesResult.isOk());
    assert.strictEqual(speciesResult.value?.id, "256");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await speciesService.findSpeciesOfEntryId("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.findSpeciesByEntryId.mock.callCount(), 0);
  });
});

test("Find all species", async () => {
  const speciesData = speciesFactory.buildList(3);

  const speciesClass = speciesClassFactory.build();
  classService.findSpeciesClassOfSpecies.mock.mockImplementation(() =>
    Promise.resolve(ok({ ...speciesClass, editable: true })),
  );

  speciesRepositoryLegacy.findEspeces.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

  await speciesService.findAllSpecies();

  assert.strictEqual(speciesRepositoryLegacy.findEspeces.mock.callCount(), 1);
  assert.deepStrictEqual(speciesRepositoryLegacy.findEspeces.mock.calls[0].arguments, [
    {
      orderBy: "code",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementation(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepositoryLegacy.findEspeces.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

    await speciesService.findPaginatedSpecies(loggedUser, {});

    assert.strictEqual(speciesRepositoryLegacy.findEspeces.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepositoryLegacy.findEspeces.mock.calls[0].arguments, [
      {
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
        searchCriteria: undefined,
      },
    ]);
  });

  test("should handle params when retrieving paginated species", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SpeciesSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementation(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepositoryLegacy.findEspeces.mock.mockImplementationOnce(() => Promise.resolve([speciesData[0]]));

    await speciesService.findPaginatedSpecies(loggedUser, searchParams);

    assert.strictEqual(speciesRepositoryLegacy.findEspeces.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepositoryLegacy.findEspeces.mock.calls[0].arguments, [
      {
        q: "Bob",
        orderBy: "code",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
        searchCriteria: undefined,
      },
    ]);
  });

  test("should handle params and search criteria when retrieving paginated species", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SpeciesSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    };

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepositoryLegacy.findEspeces.mock.mockImplementationOnce(() => Promise.resolve([speciesData[0]]));

    await speciesService.findPaginatedSpecies(loggedUser, searchParams);

    assert.strictEqual(speciesRepositoryLegacy.findEspeces.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepositoryLegacy.findEspeces.mock.calls[0].arguments, [
      {
        q: "Bob",
        searchCriteria: {
          ageIds: [12, 23],
          associateIds: undefined,
          behaviorIds: undefined,
          breeders: undefined,
          classIds: undefined,
          comment: undefined,
          departmentIds: undefined,
          distance: undefined,
          distanceEstimateIds: undefined,
          duration: undefined,
          entryId: undefined,
          environmentIds: undefined,
          fromDate: undefined,
          inventoryId: undefined,
          localityIds: undefined,
          number: undefined,
          numberEstimateIds: undefined,
          observerIds: undefined,
          regroupment: undefined,
          sexIds: undefined,
          speciesIds: undefined,
          temperature: undefined,
          time: undefined,
          toDate: "2010-01-01",
          townIds: [3, 6],
          weatherIds: undefined,
        },
        orderBy: "code",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await speciesService.findPaginatedSpecies(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
    assert.strictEqual(speciesRepositoryLegacy.findEspeces.mock.callCount(), 0);
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, {});

    assert.strictEqual(speciesRepositoryLegacy.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepositoryLegacy.getCount.mock.calls[0].arguments, [
      {
        q: undefined,
        searchCriteria: undefined,
      },
    ]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, { q: "test" });

    assert.strictEqual(speciesRepositoryLegacy.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepositoryLegacy.getCount.mock.calls[0].arguments, [
      { q: "test", searchCriteria: undefined },
    ]);
  });

  test("should handle to be called with some donnee criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, {
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    });

    assert.strictEqual(speciesRepositoryLegacy.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepositoryLegacy.getCount.mock.calls[0].arguments, [
      {
        q: undefined,
        searchCriteria: {
          ageIds: [12, 23],
          associateIds: undefined,
          behaviorIds: undefined,
          breeders: undefined,
          classIds: undefined,
          comment: undefined,
          departmentIds: undefined,
          distance: undefined,
          distanceEstimateIds: undefined,
          duration: undefined,
          entryId: undefined,
          environmentIds: undefined,
          fromDate: undefined,
          inventoryId: undefined,
          localityIds: undefined,
          number: undefined,
          numberEstimateIds: undefined,
          observerIds: undefined,
          regroupment: undefined,
          sexIds: undefined,
          speciesIds: undefined,
          temperature: undefined,
          time: undefined,
          toDate: "2010-01-01",
          townIds: [3, 6],
          weatherIds: undefined,
        },
      },
    ]);
  });

  test("should handle to be called with both espece and donnee criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, {
      q: "test",
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    });

    assert.strictEqual(speciesRepositoryLegacy.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepositoryLegacy.getCount.mock.calls[0].arguments, [
      {
        q: "test",
        searchCriteria: {
          ageIds: [12, 23],
          associateIds: undefined,
          behaviorIds: undefined,
          breeders: undefined,
          classIds: undefined,
          comment: undefined,
          departmentIds: undefined,
          distance: undefined,
          distanceEstimateIds: undefined,
          duration: undefined,
          entryId: undefined,
          environmentIds: undefined,
          fromDate: undefined,
          inventoryId: undefined,
          localityIds: undefined,
          number: undefined,
          numberEstimateIds: undefined,
          observerIds: undefined,
          regroupment: undefined,
          sexIds: undefined,
          speciesIds: undefined,
          temperature: undefined,
          time: undefined,
          toDate: "2010-01-01",
          townIds: [3, 6],
          weatherIds: undefined,
        },
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesService.getSpeciesCount(null, {});

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
    assert.strictEqual(speciesRepositoryLegacy.getCount.mock.callCount(), 0);
  });
});

describe("Update of a species", () => {
  test("should be allowed when requested by an admin", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateSpecies.mock.mockImplementationOnce(() => Promise.resolve(ok(species)));

    await speciesService.updateSpecies(12, speciesData, loggedUser);

    assert.strictEqual(speciesRepository.updateSpecies.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.updateSpecies.mock.calls[0].arguments, [12, speciesData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesFactory.build({
      ownerId: "notAdmin",
    });

    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpeciesById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateSpecies.mock.mockImplementationOnce(() => Promise.resolve(ok(species)));

    await speciesService.updateSpecies(12, speciesData, loggedUser);

    assert.strictEqual(speciesRepository.updateSpecies.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.updateSpecies.mock.calls[0].arguments, [12, speciesData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = speciesFactory.build({
      ownerId: "notAdmin",
    });

    const speciesData = upsertSpeciesInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    speciesRepository.findSpeciesById.mock.mockImplementationOnce(() => Promise.resolve(ok(existingData)));

    assert.deepStrictEqual(await speciesService.updateSpecies(12, speciesData, user), err("notAllowed"));

    assert.strictEqual(speciesRepository.updateSpecies.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a species that exists", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    speciesRepository.updateSpecies.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    assert.deepStrictEqual(await speciesService.updateSpecies(12, speciesData, loggedUser), err("alreadyExists"));

    assert.strictEqual(speciesRepository.updateSpecies.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.updateSpecies.mock.calls[0].arguments, [12, speciesData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const updateResult = await speciesService.updateSpecies(12, speciesData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.updateSpecies.mock.callCount(), 0);
  });
});

describe("Creation of a species", () => {
  test("should create new species", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.createSpecies.mock.mockImplementationOnce(() => Promise.resolve(ok(species)));

    await speciesService.createSpecies(speciesData, loggedUser);

    assert.strictEqual(speciesRepository.createSpecies.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.createSpecies.mock.calls[0].arguments, [
      {
        ...speciesData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a species that already exists", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    speciesRepository.createSpecies.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    assert.deepStrictEqual(await speciesService.createSpecies(speciesData, loggedUser), err("alreadyExists"));

    assert.strictEqual(speciesRepository.createSpecies.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.createSpecies.mock.calls[0].arguments, [
      {
        ...speciesData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const createResult = await speciesService.createSpecies(speciesData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.createSpecies.mock.callCount(), 0);
  });
});

describe("Deletion of a species", () => {
  test("should handle the deletion of an owned species", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const speciesClass = speciesClassFactory.build();
    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });

    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    speciesRepository.findSpeciesById.mock.mockImplementationOnce(() => Promise.resolve(species));

    await speciesService.deleteSpecies(11, loggedUser);

    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.deleteSpeciesById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any species if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    const speciesClass = speciesClassFactory.build();

    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    speciesRepository.findSpeciesById.mock.mockImplementationOnce(() => Promise.resolve(speciesFactory.build()));

    await speciesService.deleteSpecies(11, loggedUser);

    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.deleteSpeciesById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned species as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    speciesRepository.findSpeciesById.mock.mockImplementationOnce(() => Promise.resolve(speciesFactory.build()));

    assert.deepStrictEqual(await speciesService.deleteSpecies(11, loggedUser), err("notAllowed"));

    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await speciesService.deleteSpecies(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.callCount(), 0);
  });
});

test("Create multiple species", async () => {
  const speciesData = speciesCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  speciesRepository.createSpeciesMultiple.mock.mockImplementationOnce(() => Promise.resolve([]));

  await speciesService.createMultipleSpecies(speciesData, loggedUser);

  assert.strictEqual(speciesRepository.createSpeciesMultiple.mock.callCount(), 1);
  assert.deepStrictEqual(speciesRepository.createSpeciesMultiple.mock.calls[0].arguments, [
    speciesData.map((species) => {
      return {
        ...species,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
