import { Commune, Departement, Prisma } from "@prisma/client";
import {
  CommunesPaginatedResult,
  FindParams,
  MutationUpsertCommuneArgs,
  QueryPaginatedCommunesArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_NOM } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import {
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  queryParametersToFindAllEntities
} from "./entities-utils";

export const findCommune = async (id: number): Promise<Commune | null> => {
  return prisma.commune.findUnique({
    where: {
      id
    }
  });
};

export const findCommuneOfLieuDitId = async (lieuDitId: number | undefined): Promise<Commune | null> => {
  return prisma.lieudit
    .findUnique({
      where: {
        id: lieuDitId
      }
    })
    .commune();
};

export const findCommunes = async (options: {
  params?: FindParams | null;
  departementId?: number | null;
}): Promise<Commune[]> => {
  const { params, departementId } = options ?? {};
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
                equals: qAsNumber
              }
            },
            qAsNumber < 10
              ? {
                  code: {
                    gte: 100 * qAsNumber,
                    lt: 100 * (qAsNumber + 1)
                  }
                }
              : {},
            qAsNumber < 100
              ? {
                  code: {
                    gte: 10 * qAsNumber,
                    lt: 10 * (qAsNumber + 1)
                  }
                }
              : {}
          ]
        }
      : {};

  const whereClause = {
    AND: [
      {
        OR: [
          codeCommuneWhereClause,
          {
            nom: {
              startsWith: q || undefined
            }
          }
        ]
      },
      departementId
        ? {
            departementId: {
              equals: departementId
            }
          }
        : {}
    ]
  };

  return prisma.commune.findMany({
    orderBy: {
      nom: "asc"
    },
    where: whereClause,
    take: max || undefined
  });
};

export const getFilterClauseCommune = (q: string | null | undefined): Prisma.CommuneWhereInput => {
  return q != null && q.length
    ? {
        OR: [
          {
            nom: {
              contains: q
            }
          },
          {
            departement: {
              code: {
                contains: q
              }
            }
          }
        ]
      }
    : {};
};

export const findAllCommunes = async (): Promise<Commune[]> => {
  return await prisma.commune.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM)
  });
};

export const findAllCommunesWithDepartements = async (): Promise<(Commune & { departement: Departement })[]> => {
  return await prisma.commune.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    include: {
      departement: true
    }
  });
};

export const findAllCommunesWithCounts = async (): Promise<Omit<Commune, "departement">[]> => {
  const communesDb = await prisma.commune.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    include: {
      _count: {
        select: {
          lieudit: true
        }
      },
      lieudit: {
        select: {
          inventaire: {
            select: {
              _count: {
                select: {
                  donnee: true
                }
              }
            }
          }
        }
      }
    }
  });

  return communesDb.map((commune) => {
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
      nbLieuxdits: commune._count.lieudit,
      nbDonnees
    };
  });
};

export const findPaginatedCommunes = async (
  options: Partial<QueryPaginatedCommunesArgs> = {}
): Promise<CommunesPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let communes: (Commune & { departement: Departement; nbLieuxDits?: number; nbDonnees?: number })[];

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
      { id: number; nbLieuxDits: number; nbDonnees: number }[]
    >`${donneesPerCommuneRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

    const communesRq = await prisma.commune.findMany({
      include: {
        departement: {
          select: {
            id: true,
            code: true,
            ownerId: true
          }
        }
      },
      where: {
        id: {
          in: nbDonneesForFilteredCommunes.map((communeInfo) => communeInfo.id) // /!\ The IN clause could break if not paginated enough
        }
      }
    });

    communes = nbDonneesForFilteredCommunes.map((communeInfo) => {
      const commune = communesRq?.find((commune) => commune.id === communeInfo.id);
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...commune!,
        nbLieuxDits: communeInfo.nbLieuxDits,
        nbDonnees: communeInfo.nbDonnees
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
            [orderByField]: sortOrder
          };
          break;
        case "departement":
          orderBy = {
            departement: {
              code: sortOrder
            }
          };
          break;
        case "nbLieuxDits":
          orderBy = {
            lieudit: {
              _count: sortOrder
            }
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
          departement: {
            select: {
              id: true,
              code: true,
              ownerId: true
            }
          },
          _count: {
            select: {
              lieudit: true
            }
          },
          lieudit: {
            select: {
              inventaire: {
                select: {
                  _count: {
                    select: {
                      donnee: true
                    }
                  }
                }
              }
            }
          }
        },
        where: getFilterClauseCommune(searchParams?.q)
      });

      communes = communesRq.map((commune) => {
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
          nbDonnees
        };
      });
    } else {
      const communesRq = await prisma.commune.findMany({
        ...getPrismaPagination(searchParams),
        orderBy,
        include: {
          departement: {
            select: {
              id: true,
              code: true,
              ownerId: true
            }
          }
        },
        where: getFilterClauseCommune(searchParams?.q)
      });

      communes = communesRq;
    }
  }

  const count = await prisma.commune.count({
    where: getFilterClauseCommune(searchParams?.q)
  });

  return {
    result: communes,
    count
  };
};

export const upsertCommune = async (args: MutationUpsertCommuneArgs, loggedUser: LoggedUser): Promise<Commune> => {
  const { id, data } = args;
  if (id) {
    return prisma.commune.update({
      where: { id },
      data
    });
  } else {
    return prisma.commune.create({ data: { ...data, ownerId: loggedUser.id } });
  }
};

export const deleteCommune = async (id: number): Promise<Commune> => {
  return prisma.commune.delete({
    where: {
      id
    }
  });
};

export const createCommunes = async (
  communes: Omit<Prisma.CommuneCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.commune.createMany({
    data: communes.map((commune) => {
      return { ...commune, ownerId: loggedUser.id };
    })
  });
};
