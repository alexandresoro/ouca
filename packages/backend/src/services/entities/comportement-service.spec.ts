import { type BehaviorsSearchParams, type UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { SortOrder } from "../../graphql/generated/graphql-types.js";
import {
  type Comportement,
  type ComportementCreateInput,
} from "../../repositories/comportement/comportement-repository-types.js";
import { type ComportementRepository } from "../../repositories/comportement/comportement-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_CODE, COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildComportementService } from "./comportement-service.js";

const comportementRepository = mock<ComportementRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const comportementService = buildComportementService({
  logger,
  comportementRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find behavior", () => {
  test("should handle a matching behavior ", async () => {
    const behaviorData = mock<Comportement>();
    const loggedUser = mock<LoggedUser>();

    comportementRepository.findComportementById.mockResolvedValueOnce(behaviorData);

    await comportementService.findComportement(12, loggedUser);

    expect(comportementRepository.findComportementById).toHaveBeenCalledTimes(1);
    expect(comportementRepository.findComportementById).toHaveBeenLastCalledWith(12);
  });

  test("should handle behavior not found", async () => {
    comportementRepository.findComportementById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(comportementService.findComportement(10, loggedUser)).resolves.toBe(null);

    expect(comportementRepository.findComportementById).toHaveBeenCalledTimes(1);
    expect(comportementRepository.findComportementById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(comportementService.findComportement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(comportementRepository.findComportementById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await comportementService.getDonneesCountByComportement("12", loggedUser);

    expect(donneeRepository.getCountByComportementId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByComportementId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(comportementService.getDonneesCountByComportement("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Find behaviors by inventary ID", () => {
  test("should handle behaviors found", async () => {
    const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];
    const loggedUser = mock<LoggedUser>();

    comportementRepository.findComportementsOfDonneeId.mockResolvedValueOnce(behaviorsData);

    const behaviors = await comportementService.findComportementsOfDonneeId(43, loggedUser);

    expect(comportementRepository.findComportementsOfDonneeId).toHaveBeenCalledTimes(1);
    expect(comportementRepository.findComportementsOfDonneeId).toHaveBeenLastCalledWith(43);
    expect(behaviors.length).toEqual(behaviorsData.length);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(comportementService.findComportementsOfDonneeId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all behaviors", async () => {
  const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];

  comportementRepository.findComportements.mockResolvedValueOnce(behaviorsData);

  await comportementService.findAllComportements();

  expect(comportementRepository.findComportements).toHaveBeenCalledTimes(1);
  expect(comportementRepository.findComportements).toHaveBeenLastCalledWith({
    orderBy: COLUMN_CODE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];
    const loggedUser = mock<LoggedUser>();

    comportementRepository.findComportements.mockResolvedValueOnce(behaviorsData);

    await comportementService.findPaginatedComportements(loggedUser, {});

    expect(comportementRepository.findComportements).toHaveBeenCalledTimes(1);
    expect(comportementRepository.findComportements).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated behaviors ", async () => {
    const behaviorsData = [mock<Comportement>(), mock<Comportement>(), mock<Comportement>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: BehaviorsSearchParams = {
      orderBy: "libelle",
      sortOrder: SortOrder.Desc,
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    comportementRepository.findComportements.mockResolvedValueOnce([behaviorsData[0]]);

    await comportementService.findPaginatedComportements(loggedUser, searchParams);

    expect(comportementRepository.findComportements).toHaveBeenCalledTimes(1);
    expect(comportementRepository.findComportements).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(comportementService.findPaginatedComportements(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await comportementService.getComportementsCount(loggedUser);

    expect(comportementRepository.getCount).toHaveBeenCalledTimes(1);
    expect(comportementRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await comportementService.getComportementsCount(loggedUser, "test");

    expect(comportementRepository.getCount).toHaveBeenCalledTimes(1);
    expect(comportementRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(comportementService.getComportementsCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a behavior", () => {
  test("should be allowed when requested by an admin", async () => {
    const behaviorData = mock<UpsertBehaviorInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await comportementService.updateComportement(12, behaviorData, loggedUser);

    expect(comportementRepository.updateComportement).toHaveBeenCalledTimes(1);
    expect(comportementRepository.updateComportement).toHaveBeenLastCalledWith(12, behaviorData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Comportement>({
      ownerId: "notAdmin",
    });

    const behaviorData = mock<UpsertBehaviorInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    comportementRepository.findComportementById.mockResolvedValueOnce(existingData);

    await comportementService.updateComportement(12, behaviorData, loggedUser);

    expect(comportementRepository.updateComportement).toHaveBeenCalledTimes(1);
    expect(comportementRepository.updateComportement).toHaveBeenLastCalledWith(12, behaviorData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Comportement>({
      ownerId: "notAdmin",
    });

    const behaviorData = mock<UpsertBehaviorInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    comportementRepository.findComportementById.mockResolvedValueOnce(existingData);

    await expect(comportementService.updateComportement(12, behaviorData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(comportementRepository.updateComportement).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a behavior that exists", async () => {
    const behaviorData = mock<UpsertBehaviorInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    comportementRepository.updateComportement.mockImplementation(uniqueConstraintFailed);

    await expect(() => comportementService.updateComportement(12, behaviorData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(comportementRepository.updateComportement).toHaveBeenCalledTimes(1);
    expect(comportementRepository.updateComportement).toHaveBeenLastCalledWith(12, behaviorData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const behaviorData = mock<UpsertBehaviorInput>();

    await expect(comportementService.updateComportement(12, behaviorData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(comportementRepository.updateComportement).not.toHaveBeenCalled();
  });
});

describe("Creation of a behavior", () => {
  test("should create new behavior", async () => {
    const behaviorData = mock<UpsertBehaviorInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await comportementService.createComportement(behaviorData, loggedUser);

    expect(comportementRepository.createComportement).toHaveBeenCalledTimes(1);
    expect(comportementRepository.createComportement).toHaveBeenLastCalledWith({
      ...behaviorData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a behavior that already exists", async () => {
    const behaviorData = mock<UpsertBehaviorInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    comportementRepository.createComportement.mockImplementation(uniqueConstraintFailed);

    await expect(() => comportementService.createComportement(behaviorData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(comportementRepository.createComportement).toHaveBeenCalledTimes(1);
    expect(comportementRepository.createComportement).toHaveBeenLastCalledWith({
      ...behaviorData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const behaviorData = mock<UpsertBehaviorInput>();

    await expect(comportementService.createComportement(behaviorData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(comportementRepository.createComportement).not.toHaveBeenCalled();
  });
});

describe("Deletion of a behavior", () => {
  test("should handle the deletion of an owned behavior", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const behavior = mock<Comportement>({
      ownerId: loggedUser.id,
    });

    comportementRepository.findComportementById.mockResolvedValueOnce(behavior);

    await comportementService.deleteComportement(11, loggedUser);

    expect(comportementRepository.deleteComportementById).toHaveBeenCalledTimes(1);
    expect(comportementRepository.deleteComportementById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any behavior if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    comportementRepository.findComportementById.mockResolvedValueOnce(mock<Comportement>());

    await comportementService.deleteComportement(11, loggedUser);

    expect(comportementRepository.deleteComportementById).toHaveBeenCalledTimes(1);
    expect(comportementRepository.deleteComportementById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned behavior as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    comportementRepository.findComportementById.mockResolvedValueOnce(mock<Comportement>());

    await expect(comportementService.deleteComportement(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(comportementRepository.deleteComportementById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(comportementService.deleteComportement(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(comportementRepository.deleteComportementById).not.toHaveBeenCalled();
  });
});

test("Create multiple comportements", async () => {
  const comportementsData = [
    mock<Omit<ComportementCreateInput, "owner_id">>(),
    mock<Omit<ComportementCreateInput, "owner_id">>(),
    mock<Omit<ComportementCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  comportementRepository.createComportements.mockResolvedValueOnce([]);

  await comportementService.createComportements(comportementsData, loggedUser);

  expect(comportementRepository.createComportements).toHaveBeenCalledTimes(1);
  expect(comportementRepository.createComportements).toHaveBeenLastCalledWith(
    comportementsData.map((comportement) => {
      return {
        ...comportement,
        owner_id: loggedUser.id,
      };
    })
  );
});
