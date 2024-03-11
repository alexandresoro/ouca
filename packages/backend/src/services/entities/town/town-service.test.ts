import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { townFactory } from "@fixtures/domain/town/town.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertTownInputFactory } from "@fixtures/services/town/town-service.fixtures.js";
import type { TownsSearchParams } from "@ou-ca/common/api/town";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type { CommuneCreateInput } from "../../../repositories/commune/commune-repository-types.js";
import type { CommuneRepository } from "../../../repositories/commune/commune-repository.js";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { mock } from "../../../utils/mock.js";
import { buildTownService } from "./town-service.js";

const townRepository = mock<CommuneRepository>();
const localityRepository = mock<LieuditRepository>();
const entryRepository = mock<DonneeRepository>();

const townService = buildTownService({
  townRepository,
  localityRepository,
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
  townRepository.findCommuneById.mock.resetCalls();
  townRepository.findCommunes.mock.resetCalls();
  townRepository.updateCommune.mock.resetCalls();
  townRepository.createCommune.mock.resetCalls();
  townRepository.createCommunes.mock.resetCalls();
  townRepository.deleteCommuneById.mock.resetCalls();
  townRepository.getCount.mock.resetCalls();
  townRepository.findCommuneByLieuDitId.mock.resetCalls();
  townRepository.findCommuneById.mock.resetCalls();
  entryRepository.getCountByCommuneId.mock.resetCalls();
  localityRepository.getCountByCommuneId.mock.resetCalls();
});

describe("Find city", () => {
  test("should handle a matching city", async () => {
    const cityData = townFactory.build();
    const loggedUser = loggedUserFactory.build();

    townRepository.findCommuneById.mock.mockImplementationOnce(() => Promise.resolve(cityData));

    await townService.findTown(12, loggedUser);

    assert.strictEqual(townRepository.findCommuneById.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.findCommuneById.mock.calls[0].arguments, [12]);
  });

  test("should handle city not found", async () => {
    townRepository.findCommuneById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await townService.findTown(10, loggedUser), ok(null));

    assert.strictEqual(townRepository.findCommuneById.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.findCommuneById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await townService.findTown(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(townRepository.findCommuneById.mock.callCount(), 0);
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getLocalitiesCountByTown("12", loggedUser);

    assert.strictEqual(localityRepository.getCountByCommuneId.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.getCountByCommuneId.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await townService.getLocalitiesCountByTown("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getEntriesCountByTown("12", loggedUser);

    assert.strictEqual(entryRepository.getCountByCommuneId.mock.callCount(), 1);
    assert.deepStrictEqual(entryRepository.getCountByCommuneId.mock.calls[0].arguments, [12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await townService.getEntriesCountByTown("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

describe("Find city by locality ID", () => {
  test("should handle a found city", async () => {
    const cityData = townFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    townRepository.findCommuneByLieuDitId.mock.mockImplementationOnce(() => Promise.resolve(cityData));

    const townResult = await townService.findTownOfLocalityId("43", loggedUser);

    assert.strictEqual(townRepository.findCommuneByLieuDitId.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.findCommuneByLieuDitId.mock.calls[0].arguments, [43]);
    assert.ok(townResult.isOk());
    assert.strictEqual(townResult._unsafeUnwrap()?.id, cityData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await townService.findTownOfLocalityId("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all cities", async () => {
  const citiesData = townFactory.buildList(3);

  townRepository.findCommunes.mock.mockImplementationOnce(() => Promise.resolve(citiesData));

  await townService.findAllTowns();

  assert.strictEqual(townRepository.findCommunes.mock.callCount(), 1);
  assert.deepStrictEqual(townRepository.findCommunes.mock.calls[0].arguments, [
    {
      orderBy: "nom",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const citiesData = townFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    townRepository.findCommunes.mock.mockImplementationOnce(() => Promise.resolve(citiesData));

    await townService.findPaginatedTowns(loggedUser, {});

    assert.strictEqual(townRepository.findCommunes.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.findCommunes.mock.calls[0].arguments, [
      {
        departmentId: undefined,
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
      },
    ]);
  });

  test("should handle params when retrieving paginated cities", async () => {
    const citiesData = townFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: TownsSearchParams = {
      orderBy: "nom",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    townRepository.findCommunes.mock.mockImplementationOnce(() => Promise.resolve([citiesData[0]]));

    await townService.findPaginatedTowns(loggedUser, searchParams);

    assert.strictEqual(townRepository.findCommunes.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.findCommunes.mock.calls[0].arguments, [
      {
        departmentId: undefined,
        q: "Bob",
        orderBy: "nom",
        sortOrder: "desc",
        offset: 0,
        limit: 10,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await townService.findPaginatedTowns(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getTownsCount(loggedUser, {});

    assert.strictEqual(townRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.getCount.mock.calls[0].arguments, [undefined, undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getTownsCount(loggedUser, { q: "test", departmentId: "12" });

    assert.strictEqual(townRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.getCount.mock.calls[0].arguments, ["test", 12]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await townService.getTownsCount(null, {});

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a city", () => {
  test("should be allowed when requested by an admin", async () => {
    const cityData = upsertTownInputFactory.build();
    const { departmentId, ...restCityData } = cityData;

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    townRepository.updateCommune.mock.mockImplementationOnce(() => Promise.resolve(townFactory.build()));

    await townService.updateTown(12, cityData, loggedUser);

    assert.strictEqual(townRepository.updateCommune.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.updateCommune.mock.calls[0].arguments, [
      12,
      { ...restCityData, departement_id: Number.NaN },
    ]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = townFactory.build({
      ownerId: "notAdmin",
    });

    const cityData = upsertTownInputFactory.build();
    const { departmentId, ...restCityData } = cityData;

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    townRepository.findCommuneById.mock.mockImplementationOnce(() => Promise.resolve(existingData));
    townRepository.updateCommune.mock.mockImplementationOnce(() => Promise.resolve(townFactory.build()));

    await townService.updateTown(12, cityData, loggedUser);

    assert.strictEqual(townRepository.updateCommune.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.updateCommune.mock.calls[0].arguments, [
      12,
      { ...restCityData, departement_id: Number.NaN },
    ]);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = townFactory.build({
      ownerId: "notAdmin",
    });

    const cityData = upsertTownInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    townRepository.findCommuneById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await townService.updateTown(12, cityData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(townRepository.updateCommune.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a city that exists", async () => {
    const cityData = upsertTownInputFactory.build();
    const { departmentId, ...restCityData } = cityData;

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    townRepository.updateCommune.mock.mockImplementationOnce(uniqueConstraintFailed);

    const updateResult = await townService.updateTown(12, cityData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(townRepository.updateCommune.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.updateCommune.mock.calls[0].arguments, [
      12,
      { ...restCityData, departement_id: Number.NaN },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const cityData = upsertTownInputFactory.build();

    const updateResult = await townService.updateTown(12, cityData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(townRepository.updateCommune.mock.callCount(), 0);
  });
});

describe("Creation of a city", () => {
  test("should create new city", async () => {
    const cityData = upsertTownInputFactory.build();
    const { departmentId, ...restCityData } = cityData;

    const loggedUser = loggedUserFactory.build({ id: "a" });

    townRepository.createCommune.mock.mockImplementationOnce(() => Promise.resolve(townFactory.build()));

    await townService.createTown(cityData, loggedUser);

    assert.strictEqual(townRepository.createCommune.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.createCommune.mock.calls[0].arguments, [
      {
        ...restCityData,
        departement_id: Number.NaN,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a city that already exists", async () => {
    const cityData = upsertTownInputFactory.build();
    const { departmentId, ...restCityData } = cityData;

    const loggedUser = loggedUserFactory.build({ id: "a" });

    townRepository.createCommune.mock.mockImplementationOnce(uniqueConstraintFailed);

    const createResult = await townService.createTown(cityData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(townRepository.createCommune.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.createCommune.mock.calls[0].arguments, [
      {
        ...restCityData,
        departement_id: Number.NaN,
        owner_id: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const cityData = upsertTownInputFactory.build();

    const createResult = await townService.createTown(cityData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(townRepository.createCommune.mock.callCount(), 0);
  });
});

describe("Deletion of a city", () => {
  test("should handle the deletion of an owned city", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const city = townFactory.build({
      ownerId: loggedUser.id,
    });

    townRepository.findCommuneById.mock.mockImplementationOnce(() => Promise.resolve(city));

    await townService.deleteTown(11, loggedUser);

    assert.strictEqual(townRepository.deleteCommuneById.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.deleteCommuneById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any city if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    townRepository.findCommuneById.mock.mockImplementationOnce(() => Promise.resolve(townFactory.build()));

    await townService.deleteTown(11, loggedUser);

    assert.strictEqual(townRepository.deleteCommuneById.mock.callCount(), 1);
    assert.deepStrictEqual(townRepository.deleteCommuneById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned city as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    townRepository.findCommuneById.mock.mockImplementationOnce(() => Promise.resolve(townFactory.build()));

    const deleteResult = await townService.deleteTown(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(townRepository.deleteCommuneById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await townService.deleteTown(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(townRepository.deleteCommuneById.mock.callCount(), 0);
  });
});

test("Create multiple cities", async () => {
  const townsData = [
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
    mock<Omit<CommuneCreateInput, "owner_id">>(),
  ];

  const loggedUser = loggedUserFactory.build();

  townRepository.createCommunes.mock.mockImplementationOnce(() => Promise.resolve([]));

  await townService.createTowns(townsData, loggedUser);

  assert.strictEqual(townRepository.createCommunes.mock.callCount(), 1);
  assert.deepStrictEqual(townRepository.createCommunes.mock.calls[0].arguments, [
    townsData.map((town) => {
      return {
        ...town,
        owner_id: loggedUser.id,
      };
    }),
  ]);
});
