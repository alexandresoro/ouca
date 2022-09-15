import { Commune, DatabaseRole, Departement, Prisma } from "@prisma/client";
import {
  FindParams,
  MutationUpsertCommuneArgs,
  QueryPaginatedCommunesArgs,
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_NOM } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
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

export const findCommune = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<(Commune & ReadonlyStatus) | null> => {
  validateAuthorization(loggedUser);

  const communeEntity = await prisma.commune.findUnique({
    where: {
      id,
    },
  });

  if (!communeEntity) {
    return null;
  }

  return {
    ...communeEntity,
    readonly: isEntityReadOnly(communeEntity, loggedUser),
  };
};

export const getDonneesCountByCommune = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      inventaire: {
        lieuDit: {
          communeId: id,
        },
      },
    },
  });
};

export const findCommuneOfLieuDitId = async (
  lieuDitId: number | undefined,
  loggedUser: LoggedUser | null = null
): Promise<(Commune & ReadonlyStatus) | null> => {
  const communeEntity = await prisma.lieudit
    .findUnique({
      where: {
        id: lieuDitId,
      },
    })
    .commune();

  if (!communeEntity) {
    return null;
  }

  return {
    ...communeEntity,
    readonly: isEntityReadOnly(communeEntity, loggedUser),
  };
};

export const findCommunes = async (
  loggedUser: LoggedUser | null,
  options: {
    params?: FindParams | null;
    departementId?: number | null;
  } = {}
): Promise<Commune[]> => {
  validateAuthorization(loggedUser);

  const { params, departementId } = options;
  const { q, max } = params ?? {};

  // Ugly workaround to search by commune code as they are stored as Int in database,
  // but we still want to search them as if they were Strings
  // e.g. we want a commune with id 773 to be returned if the user query is "077" for example
  const qAsNumber = q ? parseInt(q) : NaN;
  const codeCommuneWhereClause =
    !isNaN(qAsNumber) && qAsNumber > 0
      ? {
          OR: [
            {
              code: {
                equals: qAsNumber,
              },
            },
            qAsNumber < 10
              ? {
                  code: {
                    gte: 100 * qAsNumber,
                    lt: 100 * (qAsNumber + 1),
                  },
                }
              : {},
            qAsNumber < 100
              ? {
                  code: {
                    gte: 10 * qAsNumber,
                    lt: 10 * (qAsNumber + 1),
                  },
                }
              : {},
          ],
        }
      : {};

  const whereClause = {
    AND: [
      {
        OR: [
          codeCommuneWhereClause,
          {
            nom: {
              startsWith: q || undefined,
            },
          },
        ],
      },
      departementId
        ? {
            departementId: {
              equals: departementId,
            },
          }
        : {},
    ],
  };

  return prisma.commune.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    where: whereClause,
    take: max || undefined,
  });
};

export const getFilterClauseCommune = (q: string | null | undefined): Prisma.CommuneWhereInput => {
  return q != null && q.length
    ? {
        OR: [
          {
            nom: {
              contains: q,
            },
          },
          {
            departement: {
              code: {
                contains: q,
              },
            },
          },
        ],
      }
    : {};
};

export const findCommunesWithDepartements = async (): Promise<(Commune & { departement: Departement })[]> => {
  return await prisma.commune.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    include: {
      departement: true,
    },
  });
};

export const findPaginatedCommunes = async (
  options: Partial<QueryPaginatedCommunesArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<(Commune & { nbLieuxDits?: number; nbDonnees?: number })[]> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let communeEntities: (Commune & { nbLieuxDits?: number; nbDonnees?: number })[];

  if (orderByField === "nbDonnees") {
    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression
      ? Prisma.sql`
    WHERE
      c.nom LIKE ${queryExpression}
    OR
      dpt.code LIKE ${queryExpression}
    `
      : Prisma.empty;

    const donneesPerCommuneRequest = Prisma.sql`
    SELECT 
      c.id, c.owner_id as ownerId, count(DISTINCT l.id) as nbLieuxDits, count(d.id) as nbDonnees
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
      c.id
    `;

    const nbDonneesForFilteredCommunes = await prisma.$queryRaw<
      { id: number; nbLieuxDits: bigint; nbDonnees: bigint }[]
    >`${donneesPerCommuneRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`.then(
      transformQueryRawResultsBigIntsToNumbers
    );

    const communesRq = await prisma.commune.findMany({
      where: {
        id: {
          in: nbDonneesForFilteredCommunes.map((communeInfo) => communeInfo.id), // /!\ The IN clause could break if not paginated enough
        },
      },
    });

    communeEntities = nbDonneesForFilteredCommunes.map((communeInfo) => {
      const commune = communesRq?.find((commune) => commune.id === communeInfo.id);
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...commune!,
        nbLieuxDits: communeInfo.nbLieuxDits,
        nbDonnees: communeInfo.nbDonnees,
      };
    });
  } else {
    let orderBy: Prisma.Enumerable<Prisma.CommuneOrderByWithRelationInput> | undefined = undefined;
    if (sortOrder) {
      switch (orderByField) {
        case "id":
        case "code":
        case "nom":
          orderBy = {
            [orderByField]: sortOrder,
          };
          break;
        case "departement":
          orderBy = {
            departement: {
              code: sortOrder,
            },
          };
          break;
        case "nbLieuxDits":
          orderBy = {
            lieudit: {
              _count: sortOrder,
            },
          };
          break;
        default:
          orderBy = {};
      }
    }

    if (includeCounts) {
      const communesRq = await prisma.commune.findMany({
        ...getPrismaPagination(searchParams),
        orderBy,
        include: {
          _count: {
            select: {
              lieudit: true,
            },
          },
          lieudit: {
            select: {
              inventaire: {
                select: {
                  _count: {
                    select: {
                      donnee: true,
                    },
                  },
                },
              },
            },
          },
        },
        where: getFilterClauseCommune(searchParams?.q),
      });

      communeEntities = communesRq.map((commune) => {
        const nbDonnees = commune.lieudit
          .map((lieudit) => {
            return lieudit.inventaire.map((inventaire) => {
              return inventaire._count.donnee;
            });
          })
          .flat(2)
          .reduce(counterReducer, 0);

        return {
          ...commune,
          nbLieuxDits: commune._count.lieudit,
          nbDonnees,
        };
      });
    } else {
      const communesRq = await prisma.commune.findMany({
        ...getPrismaPagination(searchParams),
        orderBy,
        where: getFilterClauseCommune(searchParams?.q),
      });

      communeEntities = communesRq;
    }
  }

  return communeEntities?.map((commune) => {
    return {
      ...commune,
      readonly: isEntityReadOnly(commune, loggedUser),
    };
  });
};

export const getCommunesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.commune.count({
    where: getFilterClauseCommune(q),
  });
};

export const upsertCommune = async (
  args: MutationUpsertCommuneArgs,
  loggedUser: LoggedUser | null
): Promise<Commune & ReadonlyStatus> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedCommune: Commune;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.commune.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedCommune = await prisma.commune.update({
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
      upsertedCommune = await prisma.commune.create({ data: { ...data, ownerId: loggedUser?.id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return {
    ...upsertedCommune,
    readonly: false,
  };
};

export const deleteCommune = async (id: number, loggedUser: LoggedUser | null): Promise<Commune> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.commune.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.commune.delete({
    where: {
      id,
    },
  });
};

export const createCommunes = async (
  communes: Omit<Prisma.CommuneCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.commune.createMany({
    data: communes.map((commune) => {
      return { ...commune, ownerId: loggedUser.id };
    }),
  });
};
