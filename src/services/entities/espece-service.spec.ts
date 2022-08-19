import { DatabaseRole, Donnee, Espece, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import { SearchDonneeCriteria } from "../../graphql/generated/graphql-types";
import { MutationUpsertEspeceArgs, QueryPaginatedEspecesArgs } from "../../model/graphql";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { buildSearchDonneeCriteria } from "./donnee-utils";
import { isEntityReadOnly, queryParametersToFindAllEntities } from "./entities-utils";
import {
  createEspeces,
  deleteEspece,
  findEspece,
  findEspeceOfDonneeId,
  findEspeces,
  findPaginatedEspeces,
  upsertEspece,
} from "./espece-service";

jest.mock("./donnee-utils", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actualModule = jest.requireActual("./donnee-utils");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...actualModule,
    buildSearchDonneeCriteria: jest.fn(),
  };
});

jest.mock("./entities-utils", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actualModule = jest.requireActual("./entities-utils");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...actualModule,
    isEntityReadOnly: jest.fn(),
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

test("should call readonly status when retrieving one species ", async () => {
  const speciesData = mock<Espece>();

  prismaMock.espece.findUnique.mockResolvedValueOnce(speciesData);

  await findEspece(speciesData.id);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: speciesData.id,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle species not found ", async () => {
  prismaMock.espece.findUnique.mockResolvedValueOnce(null);

  await expect(findEspece(10)).resolves.toBe(null);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving species by data ID ", async () => {
  const speciesData = mock<Espece>({
    id: 256,
  });

  const data = mockDeep<Prisma.Prisma__DonneeClient<Donnee>>();
  data.espece.mockResolvedValueOnce(speciesData);

  prismaMock.donnee.findUnique.mockReturnValueOnce(data);

  const species = await findEspeceOfDonneeId(43);

  expect(prismaMock.donnee.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.donnee.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
  expect(species?.id).toEqual(256);
});

test("should handle species not found when retrieving species by data ID ", async () => {
  const data = mockDeep<Prisma.Prisma__DonneeClient<Donnee>>();
  data.espece.mockResolvedValueOnce(null);

  prismaMock.donnee.findUnique.mockReturnValueOnce(data);

  const species = await findEspeceOfDonneeId(43);

  expect(prismaMock.donnee.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.donnee.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43,
    },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
  expect(species).toBeNull();
});

test("should call readonly status when retrieving species by params ", async () => {
  const commonResultEspece = mock<Espece>();
  const codeSpeciesData = [mock<Espece>(), mock<Espece>(), commonResultEspece];
  const libelleSpeciesData = [mock<Espece>(), commonResultEspece];

  prismaMock.espece.findMany.mockResolvedValueOnce(codeSpeciesData);
  prismaMock.espece.findMany.mockResolvedValueOnce(libelleSpeciesData);

  await findEspeces();

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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(codeSpeciesData.length + libelleSpeciesData.length - 1);
});

test("should call readonly status when retrieving paginated species", async () => {
  const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];

  prismaMock.espece.findMany.mockResolvedValueOnce(speciesData);

  await findPaginatedEspeces();

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: {
        select: {
          id: true,
          libelle: true,
        },
      },
    },
    orderBy: undefined,
    where: { AND: [{}, {}] },
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(speciesData.length);
});

test("should handle params when retrieving paginated species ", async () => {
  const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];

  const searchParams: QueryPaginatedEspecesArgs = {
    orderBy: "code",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.espece.findMany.mockResolvedValueOnce([speciesData[0]]);

  await findPaginatedEspeces(searchParams);

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: {
        select: {
          id: true,
          libelle: true,
        },
      },
    },
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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle params and search criteria when retrieving paginated species ", async () => {
  const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];

  const searchParams: QueryPaginatedEspecesArgs = {
    orderBy: "code",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10,
    },
    includeCounts: false,
  };

  prismaMock.espece.findMany.mockResolvedValueOnce([speciesData[0]]);

  const whereInput = mock<Prisma.DonneeWhereInput>();
  const { espece, especeId, ...restWhereInput } = whereInput;

  mockedBuildSearchDonneeCriteria.mockReturnValueOnce(whereInput);

  await findPaginatedEspeces(searchParams, mock<SearchDonneeCriteria>());

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: {
        select: {
          id: true,
          libelle: true,
        },
      },
    },
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
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should update an existing species as an admin ", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>();

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  await upsertEspece(speciesData, loggedUser);

  expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
    data: speciesData.data,
    where: {
      id: speciesData.id,
    },
  });
});

test("should update an existing species if owner ", async () => {
  const existingData = mock<Espece>({
    ownerId: "notAdmin",
  });

  const speciesData = mock<MutationUpsertEspeceArgs>();

  const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

  prismaMock.espece.findFirst.mockResolvedValueOnce(existingData);

  await upsertEspece(speciesData, loggedUser);

  expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
    data: speciesData.data,
    where: {
      id: speciesData.id,
    },
  });
});

test("should throw an error when updating an existing species and nor owner nor admin ", async () => {
  const existingData = mock<Espece>({
    ownerId: "notAdmin",
  });

  const speciesData = mock<MutationUpsertEspeceArgs>();

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor,
  };

  prismaMock.espece.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertEspece(speciesData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.espece.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a species that exists", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>({
    id: 12,
  });

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  prismaMock.espece.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertEspece(speciesData, loggedUser)).rejects.toThrowError(
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

test("should create new species ", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>({
    id: undefined,
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  await upsertEspece(speciesData, loggedUser);

  expect(prismaMock.espece.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.create).toHaveBeenLastCalledWith({
    data: {
      ...speciesData.data,
      ownerId: loggedUser.id,
    },
  });
});

test("should throw an error when trying to create a species that exists", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>({
    id: undefined,
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  prismaMock.espece.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertEspece(speciesData, loggedUser)).rejects.toThrowError(
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

test("should be able to delete an owned species", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor,
  };

  const species = mock<Espece>({
    ownerId: loggedUser.id,
  });

  prismaMock.espece.findFirst.mockResolvedValueOnce(species);

  await deleteEspece(11, loggedUser);

  expect(prismaMock.espece.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11,
    },
  });
});

test("should be able to delete any species if admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.admin,
  });

  prismaMock.espece.findFirst.mockResolvedValueOnce(mock<Espece>());

  await deleteEspece(11, loggedUser);

  expect(prismaMock.espece.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11,
    },
  });
});

test("should return an error when deleting a non-owned species as non-admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.contributor,
  });

  prismaMock.espece.findFirst.mockResolvedValueOnce(mock<Espece>());

  await expect(deleteEspece(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.espece.delete).toHaveBeenCalledTimes(0);
});

test("should create new species", async () => {
  const speciesData = [
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createEspeces(speciesData, loggedUser);

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
