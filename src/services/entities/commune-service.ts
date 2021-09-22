import { Prisma } from "@prisma/client";
import { Commune, CommunesPaginatedResult, QueryCommunesArgs } from "../../model/graphql";
import { Commune as CommuneDb } from "../../model/types/commune.model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { buildCommuneFromCommuneDb } from "../../sql/entities-mapping/commune-mapping";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_NOM, TABLE_COMMUNE } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getPrismaPagination, getSqlPagination, getSqlSorting } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

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

export const findAllCommunes = async (): Promise<CommuneDb[]> => {
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
      ...buildCommuneFromCommuneDb(commune),
      nbLieuxdits: commune._count.lieudit,
      nbDonnees
    }
  });
};

export const findCommunes = async (
  options: QueryCommunesArgs = {},
  includeCounts = true
): Promise<CommunesPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let communes: Commune[];

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

    const nbDonneesForFilteredCommunes = await prisma.$queryRaw<({ id: number, nbDonnees: number })[]>`${donneesPerCommuneRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

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

export const persistCommune = async (
  commune: CommuneDb
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_COMMUNE, commune, DB_SAVE_MAPPING_COMMUNE);
};

export const insertCommunes = async (
  communes: CommuneDb[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_COMMUNE, communes, DB_SAVE_MAPPING_COMMUNE);
};
