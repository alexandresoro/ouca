import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { behaviorFactory } from "@fixtures/domain/behavior/behavior.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertBehaviorInputFactory } from "@fixtures/services/behavior/behavior-service.fixtures.js";
import { type BehaviorsSearchParams } from "@ou-ca/common/api/behavior";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type ComportementRepository } from "../../../repositories/comportement/comportement-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildBehaviorService } from "./behavior-service.js";

const behaviorRepository = mockVi<ComportementRepository>();
const entryRepository = mockVi<DonneeRepository>();

const behaviorService = buildBehaviorService({
  behaviorRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find behavior", () => {
  test("should handle a matching behavior", async () => {
    const behaviorData = behaviorFactory.build();
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findComportementById.mockResolvedValueOnce(behaviorData);

    await behaviorService.findBehavior(12, loggedUser);

    expect(behaviorRepository.findComportementById).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.findComportementById).toHaveBeenLastCalledWith(12);
  });

  test("should handle behavior not found", async () => {
    behaviorRepository.findComportementById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(behaviorService.findBehavior(10, loggedUser)).resolves.toEqual(null);

    expect(behaviorRepository.findComportementById).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.findComportementById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    await expect(behaviorService.findBehavior(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(behaviorRepository.findComportementById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getEntriesCountByBehavior("12", loggedUser);

    expect(entryRepository.getCountByComportementId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByComportementId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(behaviorService.getEntriesCountByBehavior("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find behaviors by inventary ID", () => {
  test("should handle behaviors found", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findComportementsOfDonneeId.mockResolvedValueOnce(behaviorsData);

    const behaviors = await behaviorService.findBehaviorsOfEntryId("43", loggedUser);

    expect(behaviorRepository.findComportementsOfDonneeId).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.findComportementsOfDonneeId).toHaveBeenLastCalledWith(43);
    expect(behaviors.length).toEqual(behaviorsData.length);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(behaviorService.findBehaviorsOfEntryId("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all behaviors", async () => {
  const behaviorsData = behaviorFactory.buildList(3);

  behaviorRepository.findComportements.mockResolvedValueOnce(behaviorsData);

  await behaviorService.findAllBehaviors();

  expect(behaviorRepository.findComportements).toHaveBeenCalledTimes(1);
  expect(behaviorRepository.findComportements).toHaveBeenLastCalledWith({
    orderBy: "code",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findComportements.mockResolvedValueOnce(behaviorsData);

    await behaviorService.findPaginatedBehaviors(loggedUser, {});

    expect(behaviorRepository.findComportements).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.findComportements).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated behaviors", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: BehaviorsSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    behaviorRepository.findComportements.mockResolvedValueOnce([behaviorsData[0]]);

    await behaviorService.findPaginatedBehaviors(loggedUser, searchParams);

    expect(behaviorRepository.findComportements).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.findComportements).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(behaviorService.findPaginatedBehaviors(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getBehaviorsCount(loggedUser);

    expect(behaviorRepository.getCount).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getBehaviorsCount(loggedUser, "test");

    expect(behaviorRepository.getCount).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(behaviorService.getBehaviorsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a behavior", () => {
  test("should be allowed when requested by an admin", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    expect(behaviorRepository.updateComportement).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.updateComportement).toHaveBeenLastCalledWith(12, behaviorData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = behaviorFactory.build({
      ownerId: "notAdmin",
    });

    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    behaviorRepository.findComportementById.mockResolvedValueOnce(existingData);

    await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    expect(behaviorRepository.updateComportement).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.updateComportement).toHaveBeenLastCalledWith(12, behaviorData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = behaviorFactory.build({
      ownerId: "notAdmin",
    });

    const behaviorData = upsertBehaviorInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    behaviorRepository.findComportementById.mockResolvedValueOnce(existingData);

    await expect(behaviorService.updateBehavior(12, behaviorData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(behaviorRepository.updateComportement).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a behavior that exists", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    behaviorRepository.updateComportement.mockImplementation(uniqueConstraintFailed);

    await expect(() => behaviorService.updateBehavior(12, behaviorData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(behaviorRepository.updateComportement).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.updateComportement).toHaveBeenLastCalledWith(12, behaviorData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    await expect(behaviorService.updateBehavior(12, behaviorData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(behaviorRepository.updateComportement).not.toHaveBeenCalled();
  });
});

describe("Creation of a behavior", () => {
  test("should create new behavior", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await behaviorService.createBehavior(behaviorData, loggedUser);

    expect(behaviorRepository.createComportement).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.createComportement).toHaveBeenLastCalledWith({
      ...behaviorData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a behavior that already exists", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "a" });

    behaviorRepository.createComportement.mockImplementation(uniqueConstraintFailed);

    await expect(() => behaviorService.createBehavior(behaviorData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(behaviorRepository.createComportement).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.createComportement).toHaveBeenLastCalledWith({
      ...behaviorData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    await expect(behaviorService.createBehavior(behaviorData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(behaviorRepository.createComportement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a behavior", () => {
  test("should handle the deletion of an owned behavior", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const behavior = behaviorFactory.build({
      ownerId: loggedUser.id,
    });

    behaviorRepository.findComportementById.mockResolvedValueOnce(behavior);

    await behaviorService.deleteBehavior(11, loggedUser);

    expect(behaviorRepository.deleteComportementById).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.deleteComportementById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any behavior if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    behaviorRepository.findComportementById.mockResolvedValueOnce(behaviorFactory.build());

    await behaviorService.deleteBehavior(11, loggedUser);

    expect(behaviorRepository.deleteComportementById).toHaveBeenCalledTimes(1);
    expect(behaviorRepository.deleteComportementById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when deleting a non-owned behavior as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    behaviorRepository.findComportementById.mockResolvedValueOnce(behaviorFactory.build());

    await expect(behaviorService.deleteBehavior(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(behaviorRepository.deleteComportementById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(behaviorService.deleteBehavior(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(behaviorRepository.deleteComportementById).not.toHaveBeenCalled();
  });
});

test("Create multiple comportements", async () => {
  const comportementsData = upsertBehaviorInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  behaviorRepository.createComportements.mockResolvedValueOnce([]);

  await behaviorService.createBehaviors(comportementsData, loggedUser);

  expect(behaviorRepository.createComportements).toHaveBeenCalledTimes(1);
  expect(behaviorRepository.createComportements).toHaveBeenLastCalledWith(
    comportementsData.map((comportement) => {
      return {
        ...comportement,
        owner_id: loggedUser.id,
      };
    })
  );
});
