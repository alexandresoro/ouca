import { Commune as CommuneEntity, Prisma } from "@prisma/client";
import { Commune, CommunesPaginatedResult, CommuneWithCounts, FindParams, MutationUpsertCommuneArgs, QueryPaginatedCommunesArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_NOM, TABLE_COMMUNE } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getPrismaPagination, getSqlPagination, getSqlSorting } from "./entities-utils";
import { insertMultipleEntities } from "./entity-service";

export const findCommune = async (id: number): Promise<CommuneEntity | null> => {
  return prisma.commune.findUnique({
    where: {
      id
    },
  });
};

export const findCommuneOfLieuDitId = async (lieuDitId: number): Promise<CommuneEntity | null> => {
  return prisma.lieudit.findUnique({
    where: {
      id: lieuDitId
    },
  }).commune();
};

export const findCommunes = async (options: {
  params?: FindParams,
  departementId?: number
}): Promise<Omit<Commune, 'departement'>[]> => {

  const { params, departementId } = options ?? {};
  const { q, max } = params ?? {};

  // Ugly workaround to search by commune code as they are stored as Int in database,
  // but we still want to search them as if they were Strings
  // e.g. we want a commune with id 773 to be returned if the user query is "077" for example
  const qAsNumber = parseInt(q);
  const codeCommuneWhereClause = (!isNaN(qAsNumber) && qAsNumber > 0) ? {
    OR: [
      {
        code: {
          equals: qAsNumber
        }
      },
      (qAsNumber < 10) ? {
        code: {
          gte: 100 * qAsNumber,
          lt: 100 * (qAsNumber + 1)
        }
      } : {},
      (qAsNumber < 100) ? {
        code: {
          gte: 10 * qAsNumber,
          lt: 10 * (qAsNumber + 1)
        }
      } : {}
    ]
  } : {}

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
      departementId ? {
        departementId: {
          equals: departementId
        }
      } : {}
    ]
  }

  return prisma.commune.findMany({
    orderBy: {
      nom: "asc"
    },
    where: whereClause,
    take: max || undefined
  });
};

export const getFilterClauseCommune = (q: string | null | undefined): Prisma.CommuneWhereInput => {
  return (q != null && q.length) ? {
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
  } : {};
}

const DB_SAVE_MAPPING_COMMUNE = {
  ...createKeyValueMapWithSameName(["code", "nom"]),
  departement_id: "departementId"
};

export const findAllCommunes = async (): Promise<CommuneEntity[]> => {
  return await prisma.commune.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM)
  });
};

export const findAllCommunesWithCounts = async (): Promise<Omit<Commune, 'departement'>[]> => {
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
    const nbDonnees = commune.lieudit.map(lieudit => {
      return lieudit.inventaire.map(inventaire => {
        return inventaire._count.donnee;
      });
    }).flat(2).reduce(counterReducer, 0)

    return {
      ...commune,
      nbLieuxdits: commune._count.lieudit,
      nbDonnees
    }
  });
};

export const findPaginatedCommunes = async (
  options: QueryPaginatedCommunesArgs = {},
  includeCounts = true
): Promise<CommunesPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let communes: CommuneWithCounts[];

  if (orderByField === "nbDonnees") {

    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression ? Prisma.sql`
    WHERE
      c.nom LIKE ${queryExpression}
    OR
      dpt.code LIKE ${queryExpression}
    ` : Prisma.empty;

    const donneesPerCommuneRequest = Prisma.sql`
    SELECT 
      c.id, count(DISTINCT l.id) as nbLieuxDits, count(d.id) as nbDonnees
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
    `

    const nbDonneesForFilteredCommunes = await prisma.$queryRaw<({ id: number, nbLieuxDits: number, nbDonnees: number })[]>`${donneesPerCommuneRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

    const communesRq = await prisma.commune.findMany({
      include: {
        departement: {
          select: {
            id: true,
            code: true
          }
        }
      },
      where: {
        id: {
          in: nbDonneesForFilteredCommunes.map(communeInfo => communeInfo.id) // /!\ The IN clause could break if not paginated enough
        }
      }
    });

    communes = nbDonneesForFilteredCommunes.map((communeInfo) => {
      const commune = communesRq?.find(commune => commune.id === communeInfo.id);
      return {
        ...commune,
        nbLieuxDits: communeInfo.nbLieuxDits,
        nbDonnees: communeInfo.nbDonnees
      };
    })

  } else {

    let orderBy: Prisma.Enumerable<Prisma.CommuneOrderByWithRelationInput>;
    switch (orderByField) {
      case "id":
      case "code":
      case "nom":
        orderBy = {
          [orderByField]: sortOrder
        }
        break;
      case "departement":
        orderBy = sortOrder && {
          departement: {
            code: sortOrder
          }
        }
        break;
      case "nbLieuxDits":
        orderBy = sortOrder && {
          lieudit: {
            _count: sortOrder
          }
        }
        break;
      default:
        orderBy = {}
    }

    const communesRq = await prisma.commune.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      include: {
        departement: {
          select: {
            id: true,
            code: true
          }
        },
        _count: {
          select: {
            lieudit: true
          }
        },
        lieudit: {
          select: {
            inventaire: includeCounts && {
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

      const nbDonnees = commune.lieudit.map(lieudit => {
        return lieudit.inventaire.map(inventaire => {
          return inventaire._count.donnee;
        });
      }).flat(2).reduce(counterReducer, 0)

      return {
        ...commune,
        nbLieuxDits: commune._count.lieudit,
        nbDonnees
      };
    })

  }

  const count = await prisma.commune.count({
    where: getFilterClauseCommune(searchParams?.q)
  });

  return {
    result: communes,
    count
  }
};

export const upsertCommune = async (
  args: MutationUpsertCommuneArgs
): Promise<CommuneEntity> => {
  const { id, data } = args;
  if (id) {
    return prisma.commune.update({
      where: { id },
      data
    });

  } else {
    return prisma.commune.create({ data });
  }
};

export const deleteCommune = async (id: number): Promise<CommuneEntity> => {
  return prisma.commune.delete({
    where: {
      id
    }
  });
}

export const insertCommunes = async (
  communes: Omit<Commune, 'departement'>[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_COMMUNE, communes, DB_SAVE_MAPPING_COMMUNE);
};
