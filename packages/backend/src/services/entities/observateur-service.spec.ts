import { type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import {
  EntitesAvecLibelleOrderBy,
  SortOrder,
  type QueryObservateursArgs,
} from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
  type Observateur,
  type ObservateurCreateInput,
} from "../../repositories/observateur/observateur-repository-types.js";
import { type ObservateurRepository } from "../../repositories/observateur/observateur-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildObservateurService } from "./observateur-service.js";

const observateurRepository = mock<ObservateurRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const observateurService = buildObservateurService({
  logger,
  observateurRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find observer", () => {
  test("should handle a matching observer", async () => {
    const observerData = mock<Observateur>();
    const loggedUser = mock<LoggedUser>();

    observateurRepository.findObservateurById.mockResolvedValueOnce(observerData);

    await observateurService.findObservateur(observerData.id, loggedUser);

    expect(observateurRepository.findObservateurById).toHaveBeenCalledTimes(1);
    expect(observateurRepository.findObservateurById).toHaveBeenLastCalledWith(observerData.id);
  });

  test("should handle observer not found", async () => {
    observateurRepository.findObservateurById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(observateurService.findObservateur(10, loggedUser)).resolves.toBe(null);

    expect(observateurRepository.findObservateurById).toHaveBeenCalledTimes(1);
    expect(observateurRepository.findObservateurById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(observateurService.findObservateur(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(observateurRepository.findObservateurById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await observateurService.getDonneesCountByObservateur(12, loggedUser);

    expect(donneeRepository.getCountByObservateurId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByObservateurId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.getDonneesCountByObservateur(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find observer by inventary ID", () => {
  test("should handle observer found", async () => {
    const observerData = mock<Observateur>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    observateurRepository.findObservateurByInventaireId.mockResolvedValueOnce(observerData);

    const observer = await observateurService.findObservateurOfInventaireId(43, loggedUser);

    expect(observateurRepository.findObservateurByInventaireId).toHaveBeenCalledTimes(1);
    expect(observateurRepository.findObservateurByInventaireId).toHaveBeenLastCalledWith(43);
    expect(observer?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.findObservateurOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find associates by inventary ID", () => {
  test("should handle observer found", async () => {
    const associatesData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];
    const loggedUser = mock<LoggedUser>();

    observateurRepository.findAssociesOfInventaireId.mockResolvedValueOnce(associatesData);

    const associates = await observateurService.findAssociesOfInventaireId(43, loggedUser);

    expect(observateurRepository.findAssociesOfInventaireId).toHaveBeenCalledTimes(1);
    expect(observateurRepository.findAssociesOfInventaireId).toHaveBeenLastCalledWith(43);
    expect(associates).toEqual(associatesData);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.findAssociesOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all observers", async () => {
  const observersData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];

  observateurRepository.findObservateurs.mockResolvedValueOnce(observersData);

  await observateurService.findAllObservateurs();

  expect(observateurRepository.findObservateurs).toHaveBeenCalledTimes(1);
  expect(observateurRepository.findObservateurs).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const observersData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];
    const loggedUser = mock<LoggedUser>();

    observateurRepository.findObservateurs.mockResolvedValueOnce(observersData);

    await observateurService.findPaginatedObservateurs(loggedUser);

    expect(observateurRepository.findObservateurs).toHaveBeenCalledTimes(1);
    expect(observateurRepository.findObservateurs).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated observers ", async () => {
    const observersData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryObservateursArgs = {
      orderBy: EntitesAvecLibelleOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    observateurRepository.findObservateurs.mockResolvedValueOnce([observersData[0]]);

    await observateurService.findPaginatedObservateurs(loggedUser, searchParams);

    expect(observateurRepository.findObservateurs).toHaveBeenCalledTimes(1);
    expect(observateurRepository.findObservateurs).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.findPaginatedObservateurs(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await observateurService.getObservateursCount(loggedUser);

    expect(observateurRepository.getCount).toHaveBeenCalledTimes(1);
    expect(observateurRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await observateurService.getObservateursCount(loggedUser, "test");

    expect(observateurRepository.getCount).toHaveBeenCalledTimes(1);
    expect(observateurRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.getObservateursCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an observer", () => {
  test("should be allowed when requested by an admin", async () => {
    const observerData = mock<UpsertObserverInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await observateurService.updateObservateur(12, observerData, loggedUser);

    expect(observateurRepository.updateObservateur).toHaveBeenCalledTimes(1);
    expect(observateurRepository.updateObservateur).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Observateur>({
      ownerId: "notAdmin",
    });

    const observerData = mock<UpsertObserverInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    observateurRepository.findObservateurById.mockResolvedValueOnce(existingData);

    await observateurService.updateObservateur(12, observerData, loggedUser);

    expect(observateurRepository.updateObservateur).toHaveBeenCalledTimes(1);
    expect(observateurRepository.updateObservateur).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should throw an error when requested by an use that is nor owner nor admin", async () => {
    const existingData = mock<Observateur>({
      ownerId: "notAdmin",
    });

    const observerData = mock<UpsertObserverInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    observateurRepository.findObservateurById.mockResolvedValueOnce(existingData);

    await expect(observateurService.updateObservateur(12, observerData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(observateurRepository.updateObservateur).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an observer that exists", async () => {
    const observerData = mock<UpsertObserverInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    observateurRepository.updateObservateur.mockImplementation(uniqueConstraintFailed);

    await expect(() => observateurService.updateObservateur(12, observerData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(observateurRepository.updateObservateur).toHaveBeenCalledTimes(1);
    expect(observateurRepository.updateObservateur).toHaveBeenLastCalledWith(12, observerData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const observerData = mock<UpsertObserverInput>();

    await expect(observateurService.updateObservateur(12, observerData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(observateurRepository.updateObservateur).not.toHaveBeenCalled();
  });
});

describe("Creation of an observer", () => {
  test("should create new observer", async () => {
    const observerData = mock<UpsertObserverInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await observateurService.createObservateur(observerData, loggedUser);

    expect(observateurRepository.createObservateur).toHaveBeenCalledTimes(1);
    expect(observateurRepository.createObservateur).toHaveBeenLastCalledWith({
      ...observerData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an observer that already exists", async () => {
    const observerData = mock<UpsertObserverInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    observateurRepository.createObservateur.mockImplementation(uniqueConstraintFailed);

    await expect(() => observateurService.createObservateur(observerData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(observateurRepository.createObservateur).toHaveBeenCalledTimes(1);
    expect(observateurRepository.createObservateur).toHaveBeenLastCalledWith({
      ...observerData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const observerData = mock<UpsertObserverInput>();

    await expect(observateurService.createObservateur(observerData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(observateurRepository.createObservateur).not.toHaveBeenCalled();
  });
});

describe("Deletion of an observer", () => {
  test("should handle the deletion of an owned observer", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const observer = mock<Observateur>({
      ownerId: loggedUser.id,
    });

    observateurRepository.findObservateurById.mockResolvedValueOnce(observer);

    await observateurService.deleteObservateur(11, loggedUser);

    expect(observateurRepository.deleteObservateurById).toHaveBeenCalledTimes(1);
    expect(observateurRepository.deleteObservateurById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any observer if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    observateurRepository.findObservateurById.mockResolvedValueOnce(mock<Observateur>());

    await observateurService.deleteObservateur(11, loggedUser);

    expect(observateurRepository.deleteObservateurById).toHaveBeenCalledTimes(1);
    expect(observateurRepository.deleteObservateurById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when trying to delete a non-owned observer as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    observateurRepository.findObservateurById.mockResolvedValueOnce(mock<Observateur>());

    await expect(observateurService.deleteObservateur(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(observateurRepository.deleteObservateurById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(observateurService.deleteObservateur(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(observateurRepository.deleteObservateurById).not.toHaveBeenCalled();
  });
});

test("Create multiple observers", async () => {
  const observersData = [
    mock<Omit<ObservateurCreateInput, "owner_id">>(),
    mock<Omit<ObservateurCreateInput, "owner_id">>(),
    mock<Omit<ObservateurCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await observateurService.createObservateurs(observersData, loggedUser);

  expect(observateurRepository.createObservateurs).toHaveBeenCalledTimes(1);
  expect(observateurRepository.createObservateurs).toHaveBeenLastCalledWith(
    observersData.map((observer) => {
      return {
        ...observer,
        owner_id: loggedUser.id,
      };
    })
  );
});
