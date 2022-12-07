import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  EntitesAvecLibelleOrderBy,
  SortOrder,
  type MutationUpsertSexeArgs,
  type QuerySexesArgs,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type SexeRepository } from "../../repositories/sexe/sexe-repository";
import { type Sexe, type SexeCreateInput } from "../../repositories/sexe/sexe-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { buildSexeService } from "./sexe-service";

const sexeRepository = mock<SexeRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const sexeService = buildSexeService({
  logger,
  sexeRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find sex", () => {
  test("should handle a matching sex", async () => {
    const sexData = mock<Sexe>();
    const loggedUser = mock<LoggedUser>();

    sexeRepository.findSexeById.mockResolvedValueOnce(sexData);

    await sexeService.findSexe(sexData.id, loggedUser);

    expect(sexeRepository.findSexeById).toHaveBeenCalledTimes(1);
    expect(sexeRepository.findSexeById).toHaveBeenLastCalledWith(sexData.id);
  });

  test("should handle sex not found", async () => {
    sexeRepository.findSexeById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(sexeService.findSexe(10, loggedUser)).resolves.toBe(null);

    expect(sexeRepository.findSexeById).toHaveBeenCalledTimes(1);
    expect(sexeRepository.findSexeById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(sexeService.findSexe(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(sexeRepository.findSexeById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await sexeService.getDonneesCountBySexe(12, loggedUser);

    expect(donneeRepository.getCountBySexeId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountBySexeId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(sexeService.getDonneesCountBySexe(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all sexes", async () => {
  const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];

  sexeRepository.findSexes.mockResolvedValueOnce(sexesData);

  await sexeService.findAllSexes();

  expect(sexeRepository.findSexes).toHaveBeenCalledTimes(1);
  expect(sexeRepository.findSexes).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];
    const loggedUser = mock<LoggedUser>();

    sexeRepository.findSexes.mockResolvedValueOnce(sexesData);

    await sexeService.findPaginatedSexes(loggedUser);

    expect(sexeRepository.findSexes).toHaveBeenCalledTimes(1);
    expect(sexeRepository.findSexes).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated sexes ", async () => {
    const sexesData = [mock<Sexe>(), mock<Sexe>(), mock<Sexe>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QuerySexesArgs = {
      orderBy: EntitesAvecLibelleOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    sexeRepository.findSexes.mockResolvedValueOnce([sexesData[0]]);

    await sexeService.findPaginatedSexes(loggedUser, searchParams);

    expect(sexeRepository.findSexes).toHaveBeenCalledTimes(1);
    expect(sexeRepository.findSexes).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(sexeService.findPaginatedSexes(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await sexeService.getSexesCount(loggedUser);

    expect(sexeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(sexeRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await sexeService.getSexesCount(loggedUser, "test");

    expect(sexeRepository.getCount).toHaveBeenCalledTimes(1);
    expect(sexeRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(sexeService.getSexesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a sex", () => {
  test("should be allowed when requested by an admin ", async () => {
    const sexData = mock<MutationUpsertSexeArgs>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await sexeService.upsertSexe(sexData, loggedUser);

    expect(sexeRepository.updateSexe).toHaveBeenCalledTimes(1);
    expect(sexeRepository.updateSexe).toHaveBeenLastCalledWith(sexData.id, sexData.data);
  });

  test("should be allowed when requested by the owner ", async () => {
    const existingData = mock<Sexe>({
      ownerId: "notAdmin",
    });

    const sexData = mock<MutationUpsertSexeArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    sexeRepository.findSexeById.mockResolvedValueOnce(existingData);

    await sexeService.upsertSexe(sexData, loggedUser);

    expect(sexeRepository.updateSexe).toHaveBeenCalledTimes(1);
    expect(sexeRepository.updateSexe).toHaveBeenLastCalledWith(sexData.id, sexData.data);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Sexe>({
      ownerId: "notAdmin",
    });

    const sexData = mock<MutationUpsertSexeArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    sexeRepository.findSexeById.mockResolvedValueOnce(existingData);

    await expect(sexeService.upsertSexe(sexData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(sexeRepository.updateSexe).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a sex that exists", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    sexeRepository.updateSexe.mockImplementation(uniqueConstraintFailed);

    await expect(() => sexeService.upsertSexe(sexData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(sexeRepository.updateSexe).toHaveBeenCalledTimes(1);
    expect(sexeRepository.updateSexe).toHaveBeenLastCalledWith(sexData.id, sexData.data);
  });

  test("should throw an error when the requester is not logged", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: 12,
    });

    await expect(sexeService.upsertSexe(sexData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(sexeRepository.updateSexe).not.toHaveBeenCalled();
  });
});

describe("Creation of a sex", () => {
  test("should create new sex", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await sexeService.upsertSexe(sexData, loggedUser);

    expect(sexeRepository.createSexe).toHaveBeenCalledTimes(1);
    expect(sexeRepository.createSexe).toHaveBeenLastCalledWith({
      ...sexData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a sex that already exists", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    sexeRepository.createSexe.mockImplementation(uniqueConstraintFailed);

    await expect(() => sexeService.upsertSexe(sexData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(sexeRepository.createSexe).toHaveBeenCalledTimes(1);
    expect(sexeRepository.createSexe).toHaveBeenLastCalledWith({
      ...sexData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const sexData = mock<MutationUpsertSexeArgs>({
      id: undefined,
    });

    await expect(sexeService.upsertSexe(sexData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(sexeRepository.createSexe).not.toHaveBeenCalled();
  });
});

describe("Deletion of a sex", () => {
  test("should handle the deletion of an owned sex", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const sex = mock<Sexe>({
      ownerId: loggedUser.id,
    });

    sexeRepository.findSexeById.mockResolvedValueOnce(sex);

    await sexeService.deleteSexe(11, loggedUser);

    expect(sexeRepository.deleteSexeById).toHaveBeenCalledTimes(1);
    expect(sexeRepository.deleteSexeById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any sex if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    sexeRepository.findSexeById.mockResolvedValueOnce(mock<Sexe>());

    await sexeService.deleteSexe(11, loggedUser);

    expect(sexeRepository.deleteSexeById).toHaveBeenCalledTimes(1);
    expect(sexeRepository.deleteSexeById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned sex as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    sexeRepository.findSexeById.mockResolvedValueOnce(mock<Sexe>());

    await expect(sexeService.deleteSexe(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(sexeRepository.deleteSexeById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(sexeService.deleteSexe(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(sexeRepository.deleteSexeById).not.toHaveBeenCalled();
  });
});

test("Create multiple sexes", async () => {
  const sexesData = [
    mock<Omit<SexeCreateInput, "owner_id">>(),
    mock<Omit<SexeCreateInput, "owner_id">>(),
    mock<Omit<SexeCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await sexeService.createSexes(sexesData, loggedUser);

  expect(sexeRepository.createSexes).toHaveBeenCalledTimes(1);
  expect(sexeRepository.createSexes).toHaveBeenLastCalledWith(
    sexesData.map((sex) => {
      return {
        ...sex,
        owner_id: loggedUser.id,
      };
    })
  );
});
