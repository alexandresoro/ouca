import { Prisma } from "@prisma/client";
import { Departement, DepartementsPaginatedResult, QueryPaginatedDepartementsArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_CODE, TABLE_DEPARTEMENT } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getPrismaPagination, getSqlPagination, getSqlSorting } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

export const getFilterClauseDepartement = (q: string | null | undefined): Prisma.DepartementWhereInput => {
  return (q != null && q.length) ? {
    code: {
      contains: q
    }
  } : {};
}

const DB_SAVE_MAPPING_DEPARTEMENT = createKeyValueMapWithSameName("code");

export const findAllDepartements = async (
  options: {
    includeCounts?: boolean
  } = {}
): Promise<Departement[]> => {

  const includeCounts = options.includeCounts ?? true;

  const departements = await prisma.departement.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      _count: includeCounts && {
        select: {
          commune: true
        }
      },
      commune: includeCounts && {
        select: {
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
      }
    }
  });

  return departements.map((departement) => {
    let nbLieuxDits: number;
    let nbDonnees: number;
    if (includeCounts) {
      nbLieuxDits = departement?.commune?.map(commune => commune._count.lieudit).reduce(counterReducer, 0) ?? 0;
      nbDonnees = departement?.commune.map(commune => {
        return commune.lieudit.map(lieudit => {
          return lieudit.inventaire.map(inventaire => {
            return inventaire._count.donnee;
          });
        })
      }).flat(3).reduce(counterReducer, 0);
    }


    return {
      ...departement,
      ... (includeCounts ? {
        nbCommunes: departement._count.commune,
        nbLieuxDits,
        nbDonnees
      } : {})
    }
  });
};

export const findPaginatedDepartements = async (
  options: QueryPaginatedDepartementsArgs = {},
  includeCounts = true
): Promise<DepartementsPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let departements: Departement[];

  if (orderByField === "nbDonnees" || orderByField === "nbLieuxDits") {

    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression ? Prisma.sql`
    WHERE
      dpt.code LIKE ${queryExpression}
    ` : Prisma.empty;

    const donneesPerDepartementRequest = Prisma.sql`
    SELECT 
      dpt.id, count(DISTINCT l.id) as nbLieuxDits, count(d.id) as nbDonnees
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
    `

    const nbDonneesForFilteredDepartements = await prisma.$queryRaw<({ id: number, nbLieuxDits: number, nbDonnees: number })[]>`${donneesPerDepartementRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

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
          in: nbDonneesForFilteredDepartements.map(departementInfo => departementInfo.id) // /!\ The IN clause could break if not paginated enough
        }
      }
    });

    departements = nbDonneesForFilteredDepartements.map((departementInfo) => {
      const departement = departementsRq?.find(departement => departement.id === departementInfo.id);

      return {
        ...departement,
        ... (includeCounts ? {
          nbCommunes: departement._count.commune,
          nbLieuxDits: departementInfo.nbLieuxDits,
          nbDonnees: departementInfo.nbDonnees
        } : {})
      }
    })

  } else {

    let orderBy: Prisma.Enumerable<Prisma.DepartementOrderByWithRelationInput>;
    switch (orderByField) {
      case "id":
      case "code":
        orderBy = {
          [orderByField]: sortOrder
        }
        break;
      case "nbCommunes":
        orderBy = sortOrder && {
          commune: {
            _count: sortOrder
          }
        }
        break;
      default:
        orderBy = {}
    }

    const departementsRq = await prisma.departement.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      include: {
        _count: includeCounts && {
          select: {
            commune: true
          }
        },
        commune: includeCounts && {
          select: {
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
        }
      },
      where: getFilterClauseDepartement(searchParams?.q)
    });

    departements = departementsRq.map((departement) => {

      let nbLieuxDits: number;
      let nbDonnees: number;
      if (includeCounts) {
        nbLieuxDits = departement?.commune?.map(commune => commune._count.lieudit).reduce(counterReducer, 0) ?? 0;
        nbDonnees = departement?.commune.map(commune => {
          return commune.lieudit.map(lieudit => {
            return lieudit.inventaire.map(inventaire => {
              return inventaire._count.donnee;
            });
          })
        }).flat(3).reduce(counterReducer, 0);
      }


      return {
        ...departement,
        ... (includeCounts ? {
          nbCommunes: departement._count.commune,
          nbLieuxDits,
          nbDonnees
        } : {})
      }
    })

  }

  const count = await prisma.departement.count({
    where: getFilterClauseDepartement(searchParams?.q)
  });

  return {
    result: departements,
    count
  }
};

export const persistDepartement = async (
  departement: Departement
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_DEPARTEMENT,
    departement,
    DB_SAVE_MAPPING_DEPARTEMENT
  );
};

export const insertDepartements = async (
  departements: Departement[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_DEPARTEMENT, departements, DB_SAVE_MAPPING_DEPARTEMENT);
};