import { observerCreateInputFactory, observerFactory } from "@fixtures/domain/observer/observer.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertObserverInputFactory } from "@fixtures/services/observer/observer-service.fixtures.js";
import { type ObserverRepository } from "@interfaces/observer-repository-interface.js";
import { type ObserversSearchParams } from "@ou-ca/common/api/observer";
import { err, ok } from "neverthrow";
import { COLUMN_LIBELLE } from "../../../utils/constants.js";
import { mockVi } from "../../../utils/mock.js";
import { buildObserverService } from "./observer-service.js";

const observerRepository = mockVi<ObserverRepository>();

const observerService = buildObserverService({
  observerRepository,
});

describe("Find observer", () => {
  test("should handle a matching observer", async () => {
    const observerData = observerFactory.build();
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObserverById.mockResolvedValueOnce(observerData);

    await observerService.findObserver(12, loggedUser);

    expect(observerRepository.findObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObserverById).toHaveBeenLastCalledWith(12);
  });

  test("should handle observer not found", async () => {
    observerRepository.findObserverById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(observerService.findObserver(10, loggedUser)).resolves.toEqual(ok(null));

    expect(observerRepository.findObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObserverById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await observerService.findObserver(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(observerRepository.findObserverById).not.toHaveBeenCalled();
  });
});

describe("Find observer by inventary ID", () => {
  test("should handle observer found", async () => {
    const observerData = observerFactory.build();
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObserverByInventoryId.mockResolvedValueOnce(observerData);

    const observerResult = await observerService.findObserverOfInventoryId(43, loggedUser);

    expect(observerRepository.findObserverByInventoryId).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObserverByInventoryId).toHaveBeenLastCalledWith(43);
    expect(observerResult.isOk()).toBeTruthy();
    expect(observerResult._unsafeUnwrap()?.id).toEqual(observerData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await observerService.findObserverOfInventoryId(12, null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

describe("Find associates by inventory ID", () => {
  test("should handle observer found", async () => {
    const associatesData = observerFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    observerRepository.findAssociatesOfInventoryId.mockResolvedValueOnce(associatesData);

    const associatesResult = await observerService.findAssociatesOfInventoryId(43, loggedUser);

    expect(observerRepository.findAssociatesOfInventoryId).toHaveBeenCalledTimes(1);
    expect(observerRepository.findAssociatesOfInventoryId).toHaveBeenLastCalledWith(43);
    expect(associatesResult.isOk()).toBeTruthy();
    expect(associatesResult._unsafeUnwrap().length).toEqual(3);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await observerService.findAssociatesOfInventoryId(12, null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all observers", async () => {
  const observersData = observerFactory.buildList(3);

  observerRepository.findObservers.mockResolvedValueOnce(observersData);

  await observerService.findAllObservers();

  expect(observerRepository.findObservers).toHaveBeenCalledTimes(1);
  expect(observerRepository.findObservers).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const observersData = observerFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObservers.mockResolvedValueOnce(observersData);

    await observerService.findPaginatedObservers(loggedUser, {});

    expect(observerRepository.findObservers).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObservers).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated observers ", async () => {
    const observersData = observerFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: ObserversSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    observerRepository.findObservers.mockResolvedValueOnce([observersData[0]]);

    await observerService.findPaginatedObservers(loggedUser, searchParams);

    expect(observerRepository.findObservers).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObservers).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await observerService.findPaginatedObservers(null, {});
    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await observerService.getObserversCount(loggedUser);

    expect(observerRepository.getCount).toHaveBeenCalledTimes(1);
    expect(observerRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await observerService.getObserversCount(loggedUser, "test");

    expect(observerRepository.getCount).toHaveBeenCalledTimes(1);
    expect(observerRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await observerService.getObserversCount(null);
    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of an observer", () => {
  test("should be allowed when requested by an admin", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    observerRepository.updateObserver.mockResolvedValueOnce(ok(observerFactory.build()));

    await observerService.updateObserver(12, observerData, loggedUser);

    expect(observerRepository.updateObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.updateObserver).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = observerFactory.build({
      ownerId: "notAdmin",
    });

    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    observerRepository.findObserverById.mockResolvedValueOnce(existingData);
    observerRepository.updateObserver.mockResolvedValueOnce(ok(observerFactory.build()));

    await observerService.updateObserver(12, observerData, loggedUser);

    expect(observerRepository.updateObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.updateObserver).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should not be allowed when requested by an use that is nor owner nor admin", async () => {
    const existingData = observerFactory.build({
      ownerId: "notAdmin",
    });

    const observerData = upsertObserverInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    observerRepository.findObserverById.mockResolvedValueOnce(existingData);

    const updateResult = await observerService.updateObserver(12, observerData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(observerRepository.updateObserver).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to an observer that exists", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    observerRepository.updateObserver.mockResolvedValueOnce(err("alreadyExists"));

    const updateResult = await observerService.updateObserver(12, observerData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(observerRepository.updateObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.updateObserver).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const observerData = upsertObserverInputFactory.build();

    const updateResult = await observerService.updateObserver(12, observerData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(observerRepository.updateObserver).not.toHaveBeenCalled();
  });
});

describe("Creation of an observer", () => {
  test("should create new observer", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    observerRepository.createObserver.mockResolvedValueOnce(ok(observerFactory.build()));

    await observerService.createObserver(observerData, loggedUser);

    expect(observerRepository.createObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.createObserver).toHaveBeenLastCalledWith({
      ...observerData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create an observer that already exists", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    observerRepository.createObserver.mockResolvedValueOnce(err("alreadyExists"));

    const createResult = await observerService.createObserver(observerData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(observerRepository.createObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.createObserver).toHaveBeenLastCalledWith({
      ...observerData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const observerData = upsertObserverInputFactory.build();

    const createResult = await observerService.createObserver(observerData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(observerRepository.createObserver).not.toHaveBeenCalled();
  });
});

describe("Deletion of an observer", () => {
  test("should handle the deletion of an owned observer", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const observer = observerFactory.build({ ownerId: loggedUser.id });

    observerRepository.findObserverById.mockResolvedValueOnce(observer);

    await observerService.deleteObserver(11, loggedUser);

    expect(observerRepository.deleteObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.deleteObserverById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any observer if admin", async () => {
    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await observerService.deleteObserver(11, loggedUser);

    expect(observerRepository.deleteObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.deleteObserverById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when trying to delete a non-owned observer as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await observerService.deleteObserver(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(observerRepository.deleteObserverById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await observerService.deleteObserver(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(observerRepository.deleteObserverById).not.toHaveBeenCalled();
  });
});

test("Create multiple observers", async () => {
  const observersData = observerCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  observerRepository.createObservers.mockResolvedValueOnce([]);

  await observerService.createObservers(observersData, loggedUser);

  expect(observerRepository.createObservers).toHaveBeenCalledTimes(1);
  expect(observerRepository.createObservers).toHaveBeenLastCalledWith(
    observersData.map((observer) => {
      return {
        ...observer,
        ownerId: loggedUser.id,
      };
    })
  );
});
