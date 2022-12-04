import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import {
  EntitesAvecLibelleOrderBy,
  SortOrder,
  type MutationUpsertAgeArgs,
  type QueryAgesArgs,
} from "../../graphql/generated/graphql-types";
import { type AgeRepository } from "../../repositories/age/age-repository";
import { type Age } from "../../repositories/age/age-repository-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { prismaMock } from "../../sql/prisma-mock";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { buildAgeService } from "./age-service";
import { queryParametersToFindAllEntities } from "./entities-utils";

const ageRepository = mock<AgeRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const ageService = buildAgeService({
  logger,
  ageRepository,
  donneeRepository,
});

const prismaConstraintFailedError = {
  code: "P2002",
  message: "Prisma error message",
};

const prismaConstraintFailed = () => {
  throw new Prisma.PrismaClientKnownRequestError(
    prismaConstraintFailedError.message,
    prismaConstraintFailedError.code,
    ""
  );
};

describe("Find age", () => {
  test("should handle a matching age", async () => {
    const ageData = mock<Age>();
    const loggedUser = mock<LoggedUser>();

    ageRepository.findAgeById.mockResolvedValueOnce(ageData);

    await ageService.findAge(ageData.id, loggedUser);

    expect(ageRepository.findAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeById).toHaveBeenLastCalledWith(ageData.id);
  });

  test("should handle age not found", async () => {
    ageRepository.findAgeById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(ageService.findAge(10, loggedUser)).resolves.toBe(null);

    expect(ageRepository.findAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.findAgeById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(ageService.findAge(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.findAgeById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await ageService.getDonneesCountByAge(12, loggedUser);

    expect(donneeRepository.getCountByAgeId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByAgeId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.getDonneesCountByAge(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all ages", async () => {
  const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.age.findMany.mockResolvedValueOnce(agesData);

  await ageService.findAges(loggedUser);

  expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.age.findMany.mockResolvedValueOnce(agesData);

    await ageService.findPaginatedAges(loggedUser);

    expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: undefined,
      where: {},
    });
  });

  test("should handle params when retrieving paginated ages ", async () => {
    const agesData = [mock<Age>(), mock<Age>(), mock<Age>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryAgesArgs = {
      orderBy: EntitesAvecLibelleOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.age.findMany.mockResolvedValueOnce([agesData[0]]);

    await ageService.findPaginatedAges(loggedUser, searchParams);

    expect(prismaMock.age.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [searchParams.orderBy!]: searchParams.sortOrder,
      },
      skip: searchParams.searchParams?.pageNumber,
      take: searchParams.searchParams?.pageSize,
      where: {
        libelle: {
          contains: searchParams.searchParams?.q,
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.findPaginatedAges(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await ageService.getAgesCount(loggedUser);

    expect(ageRepository.getCount).toHaveBeenCalledTimes(1);
    expect(ageRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await ageService.getAgesCount(loggedUser, "test");

    expect(ageRepository.getCount).toHaveBeenCalledTimes(1);
    expect(ageRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.getAgesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an age", () => {
  test("should be allowed when requested by an admin", async () => {
    const ageData = mock<MutationUpsertAgeArgs>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await ageService.upsertAge(ageData, loggedUser);

    expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.update).toHaveBeenLastCalledWith({
      data: ageData.data,
      where: {
        id: ageData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Age>({
      ownerId: "notAdmin",
    });

    const ageData = mock<MutationUpsertAgeArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    ageRepository.findAgeById.mockResolvedValueOnce(existingData);

    await ageService.upsertAge(ageData, loggedUser);

    expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.update).toHaveBeenLastCalledWith({
      data: ageData.data,
      where: {
        id: ageData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Age>({
      ownerId: "notAdmin",
    });

    const ageData = mock<MutationUpsertAgeArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    ageRepository.findAgeById.mockResolvedValueOnce(existingData);

    await expect(ageService.upsertAge(ageData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.age.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an age that exists", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    prismaMock.age.update.mockImplementation(prismaConstraintFailed);

    await expect(() => ageService.upsertAge(ageData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.age.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.update).toHaveBeenLastCalledWith({
      data: ageData.data,
      where: {
        id: ageData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: 12,
    });

    await expect(ageService.upsertAge(ageData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.age.update).not.toHaveBeenCalled();
  });
});

describe("Creation of an age", () => {
  test("should create new age", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await ageService.upsertAge(ageData, loggedUser);

    expect(prismaMock.age.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.create).toHaveBeenLastCalledWith({
      data: {
        ...ageData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create an age that already exists", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.age.create.mockImplementation(prismaConstraintFailed);

    await expect(() => ageService.upsertAge(ageData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.age.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.age.create).toHaveBeenLastCalledWith({
      data: {
        ...ageData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const ageData = mock<MutationUpsertAgeArgs>({
      id: undefined,
    });

    await expect(ageService.upsertAge(ageData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.age.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of an age", () => {
  test("should handle the deletion of an owned age", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const age = mock<Age>({
      ownerId: loggedUser.id,
    });

    ageRepository.findAgeById.mockResolvedValueOnce(age);

    await ageService.deleteAge(11, loggedUser);

    expect(ageRepository.deleteAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.deleteAgeById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any age if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    ageRepository.findAgeById.mockResolvedValueOnce(mock<Age>());

    await ageService.deleteAge(11, loggedUser);

    expect(ageRepository.deleteAgeById).toHaveBeenCalledTimes(1);
    expect(ageRepository.deleteAgeById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned age as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    ageRepository.findAgeById.mockResolvedValueOnce(mock<Age>());

    await expect(ageService.deleteAge(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(ageRepository.deleteAgeById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(ageService.deleteAge(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(ageRepository.deleteAgeById).not.toHaveBeenCalled();
  });
});

test("Create multiple ages", async () => {
  const agesData = [
    mock<Omit<Prisma.AgeCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.AgeCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.AgeCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await ageService.createAges(agesData, loggedUser);

  expect(prismaMock.age.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.age.createMany).toHaveBeenLastCalledWith({
    data: agesData.map((age) => {
      return {
        ...age,
        ownerId: loggedUser.id,
      };
    }),
  });
});
