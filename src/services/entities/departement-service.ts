import { Prisma } from "@prisma/client";
import { type Logger } from "pino";
import {
  type FindParams,
  type MutationUpsertDepartementArgs,
  type QueryDepartementsArgs,
} from "../../graphql/generated/graphql-types";
import { type DepartementRepository } from "../../repositories/departement/departement-repository";
import { type Departement } from "../../repositories/departement/departement-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import {
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  queryParametersToFindAllEntities,
  transformQueryRawResultsBigIntsToNumbers,
} from "./entities-utils";

type DepartementServiceDependencies = {
  logger: Logger;
  departementRepository: DepartementRepository;
};

export const buildDepartementService = ({ logger, departementRepository }: DepartementServiceDependencies) => {
  return {};
};

export type DepartementService = ReturnType<typeof buildDepartementService>;

export const getFilterClauseDepartement = (q: string | null | undefined): Prisma.DepartementWhereInput => {
  return q != null && q.length
    ? {
        code: {
          contains: q,
        },
      }
    : {};
};

export const findDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<Departement | null> => {
  validateAuthorization(loggedUser);

  return prisma.departement.findUnique({
    where: {
      id,
    },
  });
};

export const getCommunesCountByDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.commune.count({
    where: {
      departementId: id,
    },
  });
};

export const getLieuxDitsCountByDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.lieudit.count({
    where: {
      commune: {
        departementId: id,
      },
    },
  });
};

export const getDonneesCountByDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      inventaire: {
        lieuDit: {
          commune: {
            departementId: id,
          },
        },
      },
    },
  });
};

export const findDepartementOfCommuneId = async (
  communeId: number | undefined,
  loggedUser: LoggedUser | null
): Promise<Departement | null> => {
  validateAuthorization(loggedUser);

  return prisma.commune
    .findUnique({
      where: {
        id: communeId,
      },
    })
    .departement();
};

export const findDepartements = async (
  loggedUser: LoggedUser | null,
  params?: FindParams | null
): Promise<Departement[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  return prisma.departement.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      code: {
        startsWith: q || undefined,
      },
    },
    take: max || undefined,
  });
};

export const findPaginatedDepartements = async (
  loggedUser: LoggedUser | null,
  options: Partial<QueryDepartementsArgs> = {}
): Promise<Departement[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = orderByField === "nbDonnees" || orderByField === "nbLieuxDits";

  let departementEntities: Departement[];

  if (isNbDonneesNeeded) {
    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression
      ? Prisma.sql`
    WHERE
      dpt.code LIKE ${queryExpression}
    `
      : Prisma.empty;

    const donneesPerDepartementRequest = Prisma.sql`
    SELECT 
      dpt.id, dpt.owner_id as ownerId, count(DISTINCT l.id) as nbLieuxDits, count(d.id) as nbDonnees
    FROM 
      donnee d 
    RIGHT JOIN 
      inventaire i
    ON 
      d.inventaire_id = i.id 
    RIGHT JOIN
      lieudit l
    ON
      i.lieudit_id = l.id
    RIGHT JOIN
      commune c
    ON
      l.commune_id = c.id
    RIGHT JOIN
      departement dpt
    ON
      c.departement_id = dpt.id
    ${filterRequest}
    GROUP BY 
      dpt.id
    `;

    const nbDonneesForFilteredDepartements = await prisma.$queryRaw<
      { id: number; ownerId: string; nbLieuxDits: bigint; nbDonnees: bigint }[]
    >`${donneesPerDepartementRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`.then(
      transformQueryRawResultsBigIntsToNumbers
    );

    const departementsRq = await prisma.departement.findMany({
      where: {
        id: {
          in: nbDonneesForFilteredDepartements.map((departementInfo) => departementInfo.id), // /!\ The IN clause could break if not paginated enough
        },
      },
    });

    departementEntities = nbDonneesForFilteredDepartements.map((departementInfo) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return departementsRq.find((departement) => departement.id === departementInfo.id)!;
    });
  } else {
    let orderBy: Prisma.Enumerable<Prisma.DepartementOrderByWithRelationInput> | undefined = undefined;
    if (sortOrder) {
      switch (orderByField) {
        case "id":
        case "code":
          orderBy = {
            [orderByField]: sortOrder,
          };
          break;
        case "nbCommunes":
          orderBy = {
            commune: {
              _count: sortOrder,
            },
          };
          break;
        default:
          orderBy = {};
      }
    }

    departementEntities = await prisma.departement.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getFilterClauseDepartement(searchParams?.q),
    });
  }

  return departementEntities;
};

export const getDepartementsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.departement.count({
    where: getFilterClauseDepartement(q),
  });
};
export const upsertDepartement = async (
  args: MutationUpsertDepartementArgs,
  loggedUser: LoggedUser | null
): Promise<Departement> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedDepartement: Departement;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await prisma.departement.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedDepartement = await prisma.departement.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  } else {
    try {
      upsertedDepartement = await prisma.departement.create({ data: { ...data, ownerId: loggedUser?.id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return upsertedDepartement;
};

export const deleteDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<Departement> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== "admin") {
    const existingData = await prisma.departement.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.departement.delete({
    where: {
      id,
    },
  });
};

export const createDepartements = async (
  departements: Omit<Prisma.DepartementCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.departement.createMany({
    data: departements.map((departement) => {
      return { ...departement, ownerId: loggedUser.id };
    }),
  });
};
