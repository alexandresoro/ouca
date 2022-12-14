import { Prisma, type Donnee } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  EspecesOrderBy,
  SortOrder,
  type MutationUpsertEspeceArgs,
  type QueryEspecesArgs,
  type SearchDonneeCriteria,
} from "../../graphql/generated/graphql-types";
import { type ClasseRepository } from "../../repositories/classe/classe-repository";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type EspeceRepository } from "../../repositories/espece/espece-repository";
import { type Espece } from "../../repositories/espece/espece-repository-types";
import { prismaMock } from "../../sql/prisma-mock";
import { type LoggedUser } from "../../types/User";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { buildSearchDonneeCriteria } from "./donnee-utils";
import { queryParametersToFindAllEntities } from "./entities-utils";
import { buildEspeceService } from "./espece-service";

const classeRepository = mock<ClasseRepository>({});
const especeRepository = mock<EspeceRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const especeService = buildEspeceService({
  logger,
  classeRepository,
  especeRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

jest.mock<typeof import("./donnee-utils")>("./donnee-utils", () => {
  const actualModule = jest.requireActual<typeof import("./donnee-utils")>("./donnee-utils");
  return {
    __esModule: true,
    ...actualModule,
    buildSearchDonneeCriteria: jest.fn(),
  };
});

const mockedBuildSearchDonneeCriteria = jest.mocked(buildSearchDonneeCriteria, true);

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

describe("Find species", () => {
  test("should handle a matching species", async () => {
    const speciesData = mock<Espece>();
    const loggedUser = mock<LoggedUser>();

    especeRepository.findEspeceById.mockResolvedValueOnce(speciesData);

    await especeService.findEspece(speciesData.id, loggedUser);

    expect(especeRepository.findEspeceById).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeceById).toHaveBeenLastCalledWith(speciesData.id);
  });

  test("should handle species not found", async () => {
    especeRepository.findEspeceById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(especeService.findEspece(10, loggedUser)).resolves.toBe(null);

    expect(especeRepository.findEspeceById).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeceById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(especeService.findEspece(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(especeRepository.findEspeceById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getDonneesCountByEspece(12, loggedUser);

    expect(donneeRepository.getCountByEspeceId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByEspeceId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.getDonneesCountByEspece(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find species by data ID", () => {
  test("should handle species found", async () => {
    const speciesData = mock<Espece>({
      id: 256,
    });
    const loggedUser = mock<LoggedUser>();

    const data = mockDeep<Prisma.Prisma__DonneeClient<Donnee>>();
    data.espece.mockResolvedValueOnce(speciesData);

    especeRepository.findEspeceByDonneeId.mockResolvedValueOnce(speciesData);

    const species = await especeService.findEspeceOfDonneeId(43, loggedUser);

    expect(especeRepository.findEspeceByDonneeId).toHaveBeenCalledTimes(1);
    expect(especeRepository.findEspeceByDonneeId).toHaveBeenLastCalledWith(43);
    expect(species?.id).toEqual(256);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.findEspeceOfDonneeId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all species", async () => {
  const commonResultEspece = mock<Espece>();
  const codeSpeciesData = [mock<Espece>(), mock<Espece>(), commonResultEspece];
  const libelleSpeciesData = [mock<Espece>(), commonResultEspece];
  const loggedUser = mock<LoggedUser>();

  prismaMock.espece.findMany.mockResolvedValueOnce(codeSpeciesData);
  prismaMock.espece.findMany.mockResolvedValueOnce(libelleSpeciesData);

  await especeService.findAllEspeces(loggedUser);

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(2);
  expect(prismaMock.espece.findMany).toHaveBeenNthCalledWith(1, {
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      AND: [
        {
          code: {
            startsWith: undefined,
          },
        },
        {},
      ],
    },
    take: undefined,
  });
  expect(prismaMock.espece.findMany).toHaveBeenNthCalledWith(2, {
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      AND: [{}, {}],
    },
    take: undefined,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.espece.findMany.mockResolvedValueOnce(speciesData);

    await especeService.findPaginatedEspeces(loggedUser);

    expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_CODE),
      orderBy: undefined,
      where: { AND: [{}, {}] },
    });
  });

  test("should handle params when retrieving paginated species ", async () => {
    const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryEspecesArgs = {
      orderBy: EspecesOrderBy.Code,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.espece.findMany.mockResolvedValueOnce([speciesData[0]]);

    await especeService.findPaginatedEspeces(loggedUser, searchParams);

    expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_CODE),
      orderBy: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [searchParams.orderBy!]: searchParams.sortOrder,
      },
      skip: searchParams.searchParams?.pageNumber,
      take: searchParams.searchParams?.pageSize,
      where: {
        AND: [
          {
            OR: [
              {
                code: {
                  contains: searchParams.searchParams?.q,
                },
              },
              {
                nomFrancais: {
                  contains: searchParams.searchParams?.q,
                },
              },
              {
                nomLatin: {
                  contains: searchParams.searchParams?.q,
                },
              },
            ],
          },
          {},
        ],
      },
    });
  });

  test("should handle params and search criteria when retrieving paginated species ", async () => {
    const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryEspecesArgs = {
      orderBy: EspecesOrderBy.Code,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.espece.findMany.mockResolvedValueOnce([speciesData[0]]);

    const whereInput = mock<Prisma.DonneeWhereInput>({
      ageId: 12,
    });
    const { espece, especeId, ...restWhereInput } = whereInput;

    // Need to be mocked twice, as we to two calls to buildSearchDonneeCriteria
    mockedBuildSearchDonneeCriteria.mockReturnValueOnce(whereInput);
    mockedBuildSearchDonneeCriteria.mockReturnValueOnce(whereInput);

    await especeService.findPaginatedEspeces(loggedUser, searchParams, mock<SearchDonneeCriteria>());

    expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_CODE),
      orderBy: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [searchParams.orderBy!]: searchParams.sortOrder,
      },
      skip: searchParams.searchParams?.pageNumber,
      take: searchParams.searchParams?.pageSize,
      where: {
        AND: [
          {
            OR: [
              {
                code: {
                  contains: searchParams.searchParams?.q,
                },
              },
              {
                nomFrancais: {
                  contains: searchParams.searchParams?.q,
                },
              },
              {
                nomLatin: {
                  contains: searchParams.searchParams?.q,
                },
              },
            ],
          },
          {
            ...espece,
            id: especeId,
            donnee: {
              some: restWhereInput,
            },
          },
        ],
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.findPaginatedEspeces(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getEspecesCount(loggedUser);

    expect(prismaMock.espece.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.count).toHaveBeenLastCalledWith({
      where: {
        AND: [{}, {}],
      },
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await especeService.getEspecesCount(loggedUser, "test");

    expect(prismaMock.espece.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.count).toHaveBeenLastCalledWith({
      where: {
        AND: [
          {
            OR: [
              {
                code: {
                  contains: "test",
                },
              },
              {
                nomFrancais: {
                  contains: "test",
                },
              },
              {
                nomLatin: {
                  contains: "test",
                },
              },
            ],
          },
          {},
        ],
      },
    });
  });

  test("should handle to be called with some donnee criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    const mockedSearchDonneeCriteriaResult = mock<Prisma.DonneeWhereInput>({
      ageId: 12,
    });
    const { espece, especeId, ...restMockedSearchDonneeCriteriaResult } = mockedSearchDonneeCriteriaResult;
    mockedBuildSearchDonneeCriteria.mockReturnValueOnce(mockedSearchDonneeCriteriaResult);

    await especeService.getEspecesCount(loggedUser, null, mock<SearchDonneeCriteria>());

    expect(prismaMock.espece.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.count).toHaveBeenLastCalledWith({
      where: {
        AND: [
          {},
          {
            ...espece,
            id: especeId,
            donnee: {
              some: restMockedSearchDonneeCriteriaResult,
            },
          },
        ],
      },
    });
  });

  test("should handle to be called with both espece and donnee criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    const mockedSearchDonneeCriteriaResult = mock<Prisma.DonneeWhereInput>({
      ageId: 12,
    });
    const { espece, especeId, ...restMockedSearchDonneeCriteriaResult } = mockedSearchDonneeCriteriaResult;
    mockedBuildSearchDonneeCriteria.mockReturnValueOnce(mockedSearchDonneeCriteriaResult);

    await especeService.getEspecesCount(loggedUser, "test", mock<SearchDonneeCriteria>());

    expect(prismaMock.espece.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.count).toHaveBeenLastCalledWith({
      where: {
        AND: [
          {
            OR: [
              {
                code: {
                  contains: "test",
                },
              },
              {
                nomFrancais: {
                  contains: "test",
                },
              },
              {
                nomLatin: {
                  contains: "test",
                },
              },
            ],
          },
          {
            ...espece,
            id: especeId,
            donnee: {
              some: restMockedSearchDonneeCriteriaResult,
            },
          },
        ],
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.getEspecesCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a species", () => {
  test("should be allowed when requested by an admin", async () => {
    const speciesData = mock<MutationUpsertEspeceArgs>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await especeService.upsertEspece(speciesData, loggedUser);

    expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
      data: speciesData.data,
      where: {
        id: speciesData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Espece>({
      ownerId: "notAdmin",
    });

    const speciesData = mock<MutationUpsertEspeceArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.espece.findFirst.mockResolvedValueOnce(existingData);

    await especeService.upsertEspece(speciesData, loggedUser);

    expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
      data: speciesData.data,
      where: {
        id: speciesData.id,
      },
    });
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<Espece>({
      ownerId: "notAdmin",
    });

    const speciesData = mock<MutationUpsertEspeceArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    prismaMock.espece.findFirst.mockResolvedValueOnce(existingData);

    await expect(especeService.upsertEspece(speciesData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.espece.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a species that exists", async () => {
    const speciesData = mock<MutationUpsertEspeceArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    prismaMock.espece.update.mockImplementation(prismaConstraintFailed);

    await expect(() => especeService.upsertEspece(speciesData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
      data: speciesData.data,
      where: {
        id: speciesData.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const speciesData = mock<MutationUpsertEspeceArgs>({
      id: 12,
    });

    await expect(especeService.upsertEspece(speciesData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.espece.update).not.toHaveBeenCalled();
  });
});

describe("Creation of a species", () => {
  test("should create new species", async () => {
    const speciesData = mock<MutationUpsertEspeceArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await especeService.upsertEspece(speciesData, loggedUser);

    expect(prismaMock.espece.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.create).toHaveBeenLastCalledWith({
      data: {
        ...speciesData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create a species that already exists", async () => {
    const speciesData = mock<MutationUpsertEspeceArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.espece.create.mockImplementation(prismaConstraintFailed);

    await expect(() => especeService.upsertEspece(speciesData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.espece.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.create).toHaveBeenLastCalledWith({
      data: {
        ...speciesData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const speciesData = mock<MutationUpsertEspeceArgs>({
      id: undefined,
    });

    await expect(especeService.upsertEspece(speciesData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.espece.create).not.toHaveBeenCalled();
  });
});

describe("Deletion of a species", () => {
  test("should handle the deletion of an owned species", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const species = mock<Espece>({
      ownerId: loggedUser.id,
    });

    prismaMock.espece.findFirst.mockResolvedValueOnce(species);

    await especeService.deleteEspece(11, loggedUser);

    expect(prismaMock.espece.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any species if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    prismaMock.espece.findFirst.mockResolvedValueOnce(mock<Espece>());

    await especeService.deleteEspece(11, loggedUser);

    expect(prismaMock.espece.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.espece.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when deleting a non-owned species as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    prismaMock.espece.findFirst.mockResolvedValueOnce(mock<Espece>());

    await expect(especeService.deleteEspece(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.espece.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(especeService.deleteEspece(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.espece.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple species", async () => {
  const speciesData = [
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await especeService.createEspeces(speciesData, loggedUser);

  expect(prismaMock.espece.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.createMany).toHaveBeenLastCalledWith({
    data: speciesData.map((species) => {
      return {
        ...species,
        ownerId: loggedUser.id,
      };
    }),
  });
});
