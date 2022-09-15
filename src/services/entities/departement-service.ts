import { DatabaseRole, Departement, Prisma } from "@prisma/client";
import {
  FindParams,
  MutationUpsertDepartementArgs,
  QueryPaginatedDepartementsArgs,
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import {
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus,
  transformQueryRawResultsBigIntsToNumbers,
} from "./entities-utils";

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
  options: Partial<QueryPaginatedDepartementsArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<Departement[]> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  // We include case where we need to includeCounts as tehre seem to be issues when requesting inventaires that have a inventaire
  // in a list of 1000+ elements
  const isNbDonneesNeeded = includeCounts || orderByField === "nbDonnees" || orderByField === "nbLieuxDits";

  let departementEntities: (Departement & { nbLieuxDits?: number; nbDonnees?: number })[];

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
      include: {
        _count: includeCounts && {
          select: {
            commune: true,
          },
        },
      },
      where: {
        id: {
          in: nbDonneesForFilteredDepartements.map((departementInfo) => departementInfo.id), // /!\ The IN clause could break if not paginated enough
        },
      },
    });

    departementEntities = nbDonneesForFilteredDepartements.map((departementInfo) => {
      const departement = departementsRq?.find((departement) => departement.id === departementInfo.id);

      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...departement!,
        ...(includeCounts
          ? {
              nbCommunes: departement?._count.commune,
              nbLieuxDits: departementInfo.nbLieuxDits,
              nbDonnees: departementInfo.nbDonnees,
            }
          : {}),
      };
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

  return departementEntities?.map((departement) => {
    return {
      ...departement,
      readonly: isEntityReadOnly(departement, loggedUser),
    };
  });
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
): Promise<Departement & ReadonlyStatus> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedDepartement: Departement;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
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

  return {
    ...upsertedDepartement,
    readonly: false,
  };
};

export const deleteDepartement = async (id: number, loggedUser: LoggedUser | null): Promise<Departement> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
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
