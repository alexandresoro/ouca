import { DatabaseRole, Departement, Prisma } from "@prisma/client";
import {
  DepartementsPaginatedResult,
  FindParams,
  MutationUpsertDepartementArgs,
  QueryPaginatedDepartementsArgs
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus
} from "./entities-utils";

export const getFilterClauseDepartement = (q: string | null | undefined): Prisma.DepartementWhereInput => {
  return q != null && q.length
    ? {
        code: {
          contains: q
        }
      }
    : {};
};

export const findDepartement = async (
  id: number,
  loggedUser: LoggedUser | null = null
): Promise<(Departement & ReadonlyStatus) | null> => {
  const departementEntity = await prisma.departement.findUnique({
    where: {
      id
    }
  });

  if (!departementEntity) {
    return null;
  }

  return {
    ...departementEntity,
    readonly: isEntityReadOnly(departementEntity, loggedUser)
  };
};

export const findDepartementOfCommuneId = async (
  communeId: number | undefined,
  loggedUser: LoggedUser | null = null
): Promise<(Departement & ReadonlyStatus) | null> => {
  const departementEntity = await prisma.commune
    .findUnique({
      where: {
        id: communeId
      }
    })
    .departement();

  if (!departementEntity) {
    return null;
  }

  return {
    ...departementEntity,
    readonly: isEntityReadOnly(departementEntity, loggedUser)
  };
};

export const findDepartements = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<(Departement & ReadonlyStatus)[]> => {
  const { q, max } = params ?? {};

  const departementEntities = await prisma.departement.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      code: {
        startsWith: q || undefined
      }
    },
    take: max || undefined
  });

  return departementEntities?.map((departement) => {
    return {
      ...departement,
      readonly: isEntityReadOnly(departement, loggedUser)
    };
  });
};

export const findPaginatedDepartements = async (
  options: Partial<QueryPaginatedDepartementsArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<DepartementsPaginatedResult> => {
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
      { id: number; ownerId: string; nbLieuxDits: number; nbDonnees: number }[]
    >`${donneesPerDepartementRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

    const departementsRq = await prisma.departement.findMany({
      include: {
        _count: includeCounts && {
          select: {
            commune: true
          }
        }
      },
      where: {
        id: {
          in: nbDonneesForFilteredDepartements.map((departementInfo) => departementInfo.id) // /!\ The IN clause could break if not paginated enough
        }
      }
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
              nbDonnees: departementInfo.nbDonnees
            }
          : {})
      };
    });
  } else {
    let orderBy: Prisma.Enumerable<Prisma.DepartementOrderByWithRelationInput> | undefined = undefined;
    if (sortOrder) {
      switch (orderByField) {
        case "id":
        case "code":
          orderBy = {
            [orderByField]: sortOrder
          };
          break;
        case "nbCommunes":
          orderBy = {
            commune: {
              _count: sortOrder
            }
          };
          break;
        default:
          orderBy = {};
      }
    }

    departementEntities = await prisma.departement.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getFilterClauseDepartement(searchParams?.q)
    });
  }

  const count = await prisma.departement.count({
    where: getFilterClauseDepartement(searchParams?.q)
  });

  const departements = departementEntities?.map((departement) => {
    return {
      ...departement,
      readonly: isEntityReadOnly(departement, loggedUser)
    };
  });

  return {
    result: departements,
    count
  };
};

export const upsertDepartement = async (
  args: MutationUpsertDepartementArgs,
  loggedUser: LoggedUser
): Promise<Departement & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedDepartement: Departement;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.departement.findFirst({
        where: { id }
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedDepartement = await prisma.departement.update({
        where: { id },
        data
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  } else {
    try {
      upsertedDepartement = await prisma.departement.create({ data: { ...data, ownerId: loggedUser.id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return {
    ...upsertedDepartement,
    readonly: false
  };
};

export const deleteDepartement = async (id: number, loggedUser: LoggedUser): Promise<Departement> => {
  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.departement.findFirst({
      where: { id }
    });

    if (existingData?.ownerId !== loggedUser.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.departement.delete({
    where: {
      id
    }
  });
};

export const createDepartements = async (
  departements: Omit<Prisma.DepartementCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.departement.createMany({
    data: departements.map((departement) => {
      return { ...departement, ownerId: loggedUser.id };
    })
  });
};
