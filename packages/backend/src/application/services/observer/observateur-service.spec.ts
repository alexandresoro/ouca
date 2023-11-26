import { OucaError } from "@domain/errors/ouca-error.js";
import { observerCreateInputFactory, observerFactory } from "@fixtures/domain/observer/observer.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertObserverInputFactory } from "@fixtures/services/observer/observer-service.fixtures.js";
import { type ObserverRepository } from "@interfaces/observer-repository-interface.js";
import { type ObserversSearchParams } from "@ou-ca/common/api/observer";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type InventaireRepository } from "../../../repositories/inventaire/inventaire-repository.js";
import { COLUMN_LIBELLE } from "../../../utils/constants.js";
import { mockVi } from "../../../utils/mock.js";
import { buildObservateurService } from "./observateur-service.js";

const observerRepository = mockVi<ObserverRepository>();
const inventaireRepository = mockVi<InventaireRepository>();
const donneeRepository = mockVi<DonneeRepository>();

const observateurService = buildObservateurService({
  observerRepository,
  inventaireRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(new Error("errorMessage"));

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find observer", () => {
  test("should handle a matching observer", async () => {
    const observerData = observerFactory.build();
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObserverById.mockResolvedValueOnce(observerData);

    await observateurService.findObservateur(12, loggedUser);

    expect(observerRepository.findObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObserverById).toHaveBeenLastCalledWith(12);
  });

  test("should handle observer not found", async () => {
    observerRepository.findObserverById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(observateurService.findObservateur(10, loggedUser)).resolves.toBe(null);

    expect(observerRepository.findObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObserverById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(observateurService.findObservateur(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(observerRepository.findObserverById).not.toHaveBeenCalled();
  });
});

describe("Find observer by inventary ID", () => {
  test("should handle observer found", async () => {
    const observerData = observerFactory.build();
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObserverByInventoryId.mockResolvedValueOnce(observerData);

    const observer = await observateurService.findObservateurOfInventaireId(43, loggedUser);

    expect(observerRepository.findObserverByInventoryId).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObserverByInventoryId).toHaveBeenLastCalledWith(43);
    expect(observer?.id).toEqual(observerData.id);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.findObservateurOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find associates by inventary ID", () => {
  test("should handle observer found", async () => {
    const associatesData = observerFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    observerRepository.findAssociatesOfInventoryId.mockResolvedValueOnce(associatesData);

    const associates = await observateurService.findAssociesOfInventaireId(43, loggedUser);

    expect(observerRepository.findAssociatesOfInventoryId).toHaveBeenCalledTimes(1);
    expect(observerRepository.findAssociatesOfInventoryId).toHaveBeenLastCalledWith(43);
    expect(associates.length).toEqual(associatesData.length);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.findAssociesOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all observers", async () => {
  const observersData = observerFactory.buildList(3);

  observerRepository.findObservers.mockResolvedValueOnce(observersData);

  await observateurService.findAllObservateurs();

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

    await observateurService.findPaginatedObservateurs(loggedUser, {});

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

    await observateurService.findPaginatedObservateurs(loggedUser, searchParams);

    expect(observerRepository.findObservers).toHaveBeenCalledTimes(1);
    expect(observerRepository.findObservers).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.findPaginatedObservateurs(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await observateurService.getObservateursCount(loggedUser);

    expect(observerRepository.getCount).toHaveBeenCalledTimes(1);
    expect(observerRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await observateurService.getObservateursCount(loggedUser, "test");

    expect(observerRepository.getCount).toHaveBeenCalledTimes(1);
    expect(observerRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.getObservateursCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an observer", () => {
  test("should be allowed when requested by an admin", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await observateurService.updateObservateur(12, observerData, loggedUser);

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

    await observateurService.updateObservateur(12, observerData, loggedUser);

    expect(observerRepository.updateObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.updateObserver).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should throw an error when requested by an use that is nor owner nor admin", async () => {
    const existingData = observerFactory.build({
      ownerId: "notAdmin",
    });

    const observerData = upsertObserverInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    observerRepository.findObserverById.mockResolvedValueOnce(existingData);

    await expect(observateurService.updateObservateur(12, observerData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(observerRepository.updateObserver).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an observer that exists", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    observerRepository.updateObserver.mockImplementation(uniqueConstraintFailed);

    await expect(() => observateurService.updateObservateur(12, observerData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(observerRepository.updateObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.updateObserver).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const observerData = upsertObserverInputFactory.build();

    await expect(observateurService.updateObservateur(12, observerData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(observerRepository.updateObserver).not.toHaveBeenCalled();
  });
});

describe("Creation of an observer", () => {
  test("should create new observer", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    await observateurService.createObservateur(observerData, loggedUser);

    expect(observerRepository.createObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.createObserver).toHaveBeenLastCalledWith({
      ...observerData,
      ownerId: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an observer that already exists", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    observerRepository.createObserver.mockImplementation(uniqueConstraintFailed);

    await expect(() => observateurService.createObservateur(observerData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(observerRepository.createObserver).toHaveBeenCalledTimes(1);
    expect(observerRepository.createObserver).toHaveBeenLastCalledWith({
      ...observerData,
      ownerId: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const observerData = upsertObserverInputFactory.build();

    await expect(observateurService.createObservateur(observerData, null)).rejects.toEqual(new OucaError("OUCA0001"));
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

    await observateurService.deleteObservateur(11, loggedUser);

    expect(observerRepository.deleteObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.deleteObserverById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any observer if admin", async () => {
    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await observateurService.deleteObservateur(11, loggedUser);

    expect(observerRepository.deleteObserverById).toHaveBeenCalledTimes(1);
    expect(observerRepository.deleteObserverById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when trying to delete a non-owned observer as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    await expect(observateurService.deleteObservateur(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(observerRepository.deleteObserverById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.deleteObservateur(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(observerRepository.deleteObserverById).not.toHaveBeenCalled();
  });
});

test("Create multiple observers", async () => {
  const observersData = observerCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  observerRepository.createObservers.mockResolvedValueOnce([]);

  await observateurService.createObservateurs(observersData, loggedUser);

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
