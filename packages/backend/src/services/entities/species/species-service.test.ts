import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { OucaError } from "@domain/errors/ouca-error.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { speciesClassFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { speciesFactory } from "@fixtures/domain/species/species.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSpeciesInputFactory } from "@fixtures/services/species/species-service.fixtures.js";
import type { SpeciesSearchParams } from "@ou-ca/common/api/species";
import { ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { SpeciesClassService } from "../../../application/services/species-class/species-class-service.js";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { EspeceCreateInput } from "../../../repositories/espece/espece-repository-types.js";
import type { EspeceRepository } from "../../../repositories/espece/espece-repository.js";
import { mock } from "../../../utils/mock.js";
import { buildSpeciesService } from "./species-service.js";

const classService = mock<SpeciesClassService>();
const speciesRepository = mock<EspeceRepository>();
const entryRepository = mock<DonneeRepository>();

const speciesService = buildSpeciesService({
  classService,
  speciesRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint",
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

beforeEach(() => {
  speciesRepository.findEspeceById.mock.resetCalls();
  speciesRepository.findEspeces.mock.resetCalls();
  speciesRepository.updateEspece.mock.resetCalls();
  speciesRepository.createEspece.mock.resetCalls();
  speciesRepository.deleteEspeceById.mock.resetCalls();
  speciesRepository.createEspeces.mock.resetCalls();
  speciesRepository.getCount.mock.resetCalls();
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

    speciesRepository.findEspeceById.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

    await speciesService.findSpecies(12, loggedUser);

    assert.strictEqual(speciesRepository.findEspeceById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findEspeceById.mock.calls[0].arguments, [12]);
  });

  test("should handle species not found", async () => {
    speciesRepository.findEspeceById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await speciesService.findSpecies(10, loggedUser), null);

    assert.strictEqual(speciesRepository.findEspeceById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findEspeceById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    await assert.rejects(speciesService.findSpecies(11, null), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
    assert.strictEqual(speciesRepository.findEspeceById.mock.callCount(), 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEntriesCountBySpecies("12", loggedUser);

    assert.strictEqual(entryRepository.getCountByEspeceId.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCountByEspeceId.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await assert.rejects(speciesService.getEntriesCountBySpecies("12", null), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
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

    speciesRepository.findEspeceByDonneeId.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

    const species = await speciesService.findSpeciesOfEntryId("43", loggedUser);

    assert.strictEqual(speciesRepository.findEspeceByDonneeId.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findEspeceByDonneeId.mock.calls[0].arguments, [43]);
    assert.strictEqual(species?.id, "256");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await assert.rejects(speciesService.findSpeciesOfEntryId("12", null), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
  });
});

test("Find all species", async () => {
  const speciesData = speciesFactory.buildList(3);

  const speciesClass = speciesClassFactory.build();
  classService.findSpeciesClassOfSpecies.mock.mockImplementation(() =>
    Promise.resolve(ok({ ...speciesClass, editable: true })),
  );

  speciesRepository.findEspeces.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

  await speciesService.findAllSpecies();

  assert.strictEqual(speciesRepository.findEspeces.mock.callCount(), 1);
  assert.deepStrictEqual(speciesRepository.findEspeces.mock.calls[0].arguments, [
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

    speciesRepository.findEspeces.mock.mockImplementationOnce(() => Promise.resolve(speciesData));

    await speciesService.findPaginatedSpecies(loggedUser, {});

    assert.strictEqual(speciesRepository.findEspeces.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findEspeces.mock.calls[0].arguments, [
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

    speciesRepository.findEspeces.mock.mockImplementationOnce(() => Promise.resolve([speciesData[0]]));

    await speciesService.findPaginatedSpecies(loggedUser, searchParams);

    assert.strictEqual(speciesRepository.findEspeces.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findEspeces.mock.calls[0].arguments, [
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

    speciesRepository.findEspeces.mock.mockImplementationOnce(() => Promise.resolve([speciesData[0]]));

    await speciesService.findPaginatedSpecies(loggedUser, searchParams);

    assert.strictEqual(speciesRepository.findEspeces.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.findEspeces.mock.calls[0].arguments, [
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
    await assert.rejects(speciesService.findPaginatedSpecies(null, {}), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, {});

    assert.strictEqual(speciesRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0].arguments, [
      {
        q: undefined,
        searchCriteria: undefined,
      },
    ]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, { q: "test" });

    assert.strictEqual(speciesRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0].arguments, [
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

    assert.strictEqual(speciesRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0].arguments, [
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

    assert.strictEqual(speciesRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0].arguments, [
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
    await assert.rejects(speciesService.getSpeciesCount(null, {}), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
  });
});

describe("Update of a species", () => {
  test("should be allowed when requested by an admin", async () => {
    const speciesData = upsertSpeciesInputFactory.build();
    const { classId, nomFrancais, nomLatin, ...restSpeciesData } = speciesData;

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateEspece.mock.mockImplementationOnce(() => Promise.resolve(species));

    await speciesService.updateSpecies(12, speciesData, loggedUser);

    assert.strictEqual(speciesRepository.updateEspece.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.updateEspece.mock.calls[0].arguments, [
      12,
      {
        ...restSpeciesData,
        classe_id: Number.NaN,
        nom_francais: nomFrancais,
        nom_latin: nomLatin,
      },
    ]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesFactory.build({
      ownerId: "notAdmin",
    });

    const speciesData = upsertSpeciesInputFactory.build();
    const { classId, nomFrancais, nomLatin, ...restSpeciesData } = speciesData;

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findEspeceById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateEspece.mock.mockImplementationOnce(() => Promise.resolve(species));

    await speciesService.updateSpecies(12, speciesData, loggedUser);

    assert.strictEqual(speciesRepository.updateEspece.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.updateEspece.mock.calls[0].arguments, [
      12,
      {
        ...restSpeciesData,
        classe_id: Number.NaN,
        nom_francais: nomFrancais,
        nom_latin: nomLatin,
      },
    ]);
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

    speciesRepository.findEspeceById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    await assert.rejects(speciesService.updateSpecies(12, speciesData, user), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });

    assert.strictEqual(speciesRepository.updateEspece.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a species that exists", async () => {
    const speciesData = upsertSpeciesInputFactory.build();
    const { classId, nomFrancais, nomLatin, ...restSpeciesData } = speciesData;

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    speciesRepository.updateEspece.mock.mockImplementationOnce(uniqueConstraintFailed);

    await assert.rejects(speciesService.updateSpecies(12, speciesData, loggedUser), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0004", uniqueConstraintFailedError));
      return true;
    });

    assert.strictEqual(speciesRepository.updateEspece.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.updateEspece.mock.calls[0].arguments, [
      12,
      {
        ...restSpeciesData,
        classe_id: Number.NaN,
        nom_francais: nomFrancais,
        nom_latin: nomLatin,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    await assert.rejects(speciesService.updateSpecies(12, speciesData, null), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
    assert.strictEqual(speciesRepository.updateEspece.mock.callCount(), 0);
  });
});

describe("Creation of a species", () => {
  test("should create new species", async () => {
    const speciesData = upsertSpeciesInputFactory.build();
    const { classId, nomFrancais, nomLatin, ...restSpeciesData } = speciesData;

    const loggedUser = loggedUserFactory.build({ id: "a" });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.createEspece.mock.mockImplementationOnce(() => Promise.resolve(species));

    await speciesService.createSpecies(speciesData, loggedUser);

    assert.strictEqual(speciesRepository.createEspece.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.createEspece.mock.calls[0].arguments, [
      {
        ...restSpeciesData,
        classe_id: Number.NaN,
        nom_francais: nomFrancais,
        nom_latin: nomLatin,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a species that already exists", async () => {
    const speciesData = upsertSpeciesInputFactory.build();
    const { classId, nomFrancais, nomLatin, ...restSpeciesData } = speciesData;

    const loggedUser = loggedUserFactory.build({ id: "a" });

    speciesRepository.createEspece.mock.mockImplementationOnce(uniqueConstraintFailed);

    await assert.rejects(speciesService.createSpecies(speciesData, loggedUser), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0004", uniqueConstraintFailedError));
      return true;
    });

    assert.strictEqual(speciesRepository.createEspece.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.createEspece.mock.calls[0].arguments, [
      {
        ...restSpeciesData,
        classe_id: Number.NaN,
        nom_francais: nomFrancais,
        nom_latin: nomLatin,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    await assert.rejects(speciesService.createSpecies(speciesData, null), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
    assert.strictEqual(speciesRepository.createEspece.mock.callCount(), 0);
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
    speciesRepository.findEspeceById.mock.mockImplementationOnce(() => Promise.resolve(species));

    await speciesService.deleteSpecies(11, loggedUser);

    assert.strictEqual(speciesRepository.deleteEspeceById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.deleteEspeceById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any species if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    const speciesClass = speciesClassFactory.build();

    classService.findSpeciesClassOfSpecies.mock.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    speciesRepository.findEspeceById.mock.mockImplementationOnce(() => Promise.resolve(speciesFactory.build()));

    await speciesService.deleteSpecies(11, loggedUser);

    assert.strictEqual(speciesRepository.deleteEspeceById.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.deleteEspeceById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned species as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    speciesRepository.findEspeceById.mock.mockImplementationOnce(() => Promise.resolve(speciesFactory.build()));

    await assert.rejects(speciesService.deleteSpecies(11, loggedUser), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });

    assert.strictEqual(speciesRepository.deleteEspeceById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await assert.rejects(speciesService.deleteSpecies(11, null), (err) => {
      assert.deepStrictEqual(err, new OucaError("OUCA0001"));
      return true;
    });
    assert.strictEqual(speciesRepository.deleteEspeceById.mock.callCount(), 0);
  });
});

test("Create multiple species", async () => {
  const speciesData = [
    mock<Omit<EspeceCreateInput, "owner_id">>(),
    mock<Omit<EspeceCreateInput, "owner_id">>(),
    mock<Omit<EspeceCreateInput, "owner_id">>(),
  ];

  const loggedUser = loggedUserFactory.build();

  speciesRepository.createEspeces.mock.mockImplementationOnce(() => Promise.resolve([]));

  await speciesService.createMultipleSpecies(speciesData, loggedUser);

  assert.strictEqual(speciesRepository.createEspeces.mock.callCount(), 1);
  assert.deepStrictEqual(speciesRepository.createEspeces.mock.calls[0].arguments, [
    speciesData.map((species) => {
      return {
        ...species,
        owner_id: loggedUser.id,
      };
    }),
  ]);
});
