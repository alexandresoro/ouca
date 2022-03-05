import { Commune, Departement, Lieudit, Prisma } from "@prisma/client";
import {
  FindParams,
  LieuxDitsPaginatedResult,
  MutationUpsertLieuDitArgs,
  QueryPaginatedLieuxditsArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_NOM } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getFilterClauseCommune } from "./commune-service";
import {
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  queryParametersToFindAllEntities
} from "./entities-utils";

export type LieuDitWithCoordinatesAsNumber<T extends Lieudit = Lieudit> = Omit<T, "latitude" | "longitude"> & {
  latitude: number;
  longitude: number;
};

const buildLieuditFromLieuditDb = <T extends Lieudit>(lieuditDb: T): LieuDitWithCoordinatesAsNumber<T> => {
  const { latitude, longitude, ...others } = lieuditDb;

  return {
    ...others,
    longitude: longitude.toNumber(),
    latitude: latitude.toNumber()
  };
};

export const findLieuDit = async (id: number | undefined): Promise<LieuDitWithCoordinatesAsNumber | null> => {
  return prisma.lieudit
    .findUnique({
      where: {
        id
      }
    })
    .then((lieudit) => (lieudit ? buildLieuditFromLieuditDb(lieudit) : null));
};

export const findLieuDitOfInventaireId = async (inventaireId: number | undefined): Promise<Lieudit | null> => {
  return prisma.inventaire
    .findUnique({
      where: {
        id: inventaireId
      }
    })
    .lieuDit();
};

export const findLieuxDits = async (options: {
  params?: FindParams | null;
  communeId?: number | null;
  departementId?: number | null;
}): Promise<Omit<LieuDitWithCoordinatesAsNumber, "commune">[]> => {
  const { params, communeId, departementId } = options ?? {};
  const { q, max } = params ?? {};

  const whereClause = {
    AND: [
      {
        nom: {
          contains: q || undefined
        }
      },
      departementId
        ? {
            commune: {
              departementId: {
                equals: departementId
              }
            }
          }
        : {},
      communeId
        ? {
            communeId: {
              equals: communeId
            }
          }
        : {}
    ]
  };

  return prisma.lieudit
    .findMany({
      orderBy: {
        nom: "asc"
      },
      where: whereClause,
      take: max || undefined
    })
    .then((lieuxDits) => lieuxDits.map(buildLieuditFromLieuditDb));
};

const getFilterClause = (q: string | null | undefined): Prisma.LieuditWhereInput => {
  return q != null && q.length
    ? {
        OR: [
          {
            nom: {
              contains: q
            }
          },
          {
            commune: getFilterClauseCommune(q)
          }
        ]
      }
    : {};
};

export const findAllLieuxDitsWithCommuneAndDepartement = async (): Promise<
  (LieuDitWithCoordinatesAsNumber & { commune: Commune & { departement: Departement } })[]
> => {
  const lieuxDitsDb = await prisma.lieudit.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    include: {
      commune: {
        include: {
          departement: true
        }
      }
    }
  });

  return lieuxDitsDb.map(buildLieuditFromLieuditDb);
};

export const findAllLieuxDits = async (options?: {
  where?: Prisma.LieuditWhereInput;
}): Promise<LieuDitWithCoordinatesAsNumber[]> => {
  const lieuxDitsDb = await prisma.lieudit.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    where: options?.where ?? {}
  });

  return lieuxDitsDb.map(buildLieuditFromLieuditDb);
};

export const findAllLieuxDitsWithCounts = async (options?: {
  where?: Prisma.LieuditWhereInput;
}): Promise<Omit<LieuDitWithCoordinatesAsNumber, "commune">[]> => {
  const lieuxDitsDb = await prisma.lieudit.findMany({
    ...queryParametersToFindAllEntities(COLUMN_NOM),
    include: {
      inventaire: {
        select: {
          _count: {
            select: {
              donnee: true
            }
          }
        }
      }
    },
    where: options?.where ?? {}
  });

  return lieuxDitsDb.map((lieudit) => {
    const nbDonnees = lieudit.inventaire
      .map((inventaire) => {
        return inventaire._count.donnee;
      })
      .reduce(counterReducer, 0);

    return {
      ...buildLieuditFromLieuditDb(lieudit),
      nbDonnees
    };
  });
};

export const findPaginatedLieuxDits = async (
  options: Partial<QueryPaginatedLieuxditsArgs> = {}
): Promise<LieuxDitsPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let lieuxDits: (LieuDitWithCoordinatesAsNumber<Lieudit> & {
    commune: Commune & { departement: Departement };
    nbDonnees?: number;
  })[];

  if (orderByField === "nbDonnees") {
    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression
      ? Prisma.sql`
    WHERE
      l.nom LIKE ${queryExpression}
    OR
      c.nom LIKE ${queryExpression}
    OR
      dpt.code LIKE ${queryExpression}
    `
      : Prisma.empty;

    const donneesPerLieuDitRequest = Prisma.sql`
    SELECT 
      l.id, count(d.id) as nbDonnees
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
      l.id
    `;

    const nbDonneesForFilteredLieuxDits = await prisma.$queryRaw<
      { id: number; nbDonnees: number }[]
    >`${donneesPerLieuDitRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

    const lieuxDitsRq = await prisma.lieudit.findMany({
      include: {
        commune: {
          include: {
            departement: {
              select: {
                id: true,
                code: true,
                ownerId: true
              }
            }
          }
        }
      },
      where: {
        id: {
          in: nbDonneesForFilteredLieuxDits.map((lieuditInfo) => lieuditInfo.id) // /!\ The IN clause could break if not paginated enough
        }
      }
    });

    lieuxDits = nbDonneesForFilteredLieuxDits.map((lieuditInfo) => {
      const lieudit = lieuxDitsRq?.find((lieudit) => lieudit.id === lieuditInfo.id);

      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...buildLieuditFromLieuditDb(lieudit!),
        nbDonnees: lieuditInfo.nbDonnees
      };
    });
  } else {
    let orderBy: Prisma.Enumerable<Prisma.LieuditOrderByWithRelationInput> | undefined = undefined;
    if (sortOrder) {
      switch (orderByField) {
        case "id":
        case "nom":
        case "altitude":
        case "longitude":
        case "latitude":
          orderBy = {
            [orderByField]: sortOrder
          };
          break;
        case "codeCommune":
          orderBy = {
            commune: {
              code: sortOrder
            }
          };
          break;
        case "nomCommune":
          orderBy = {
            commune: {
              nom: sortOrder
            }
          };
          break;
        case "departement":
          orderBy = {
            commune: {
              departement: {
                code: sortOrder
              }
            }
          };
          break;
        default:
          orderBy = {};
      }
    }

    if (includeCounts) {
      const lieuxDitsRq = await prisma.lieudit.findMany({
        ...getPrismaPagination(searchParams),
        orderBy,
        include: {
          commune: {
            include: {
              departement: {
                select: {
                  id: true,
                  code: true,
                  ownerId: true
                }
              }
            }
          },
          inventaire: {
            select: {
              _count: {
                select: {
                  donnee: true
                }
              }
            }
          }
        },
        where: getFilterClause(searchParams?.q)
      });

      lieuxDits = lieuxDitsRq.map((lieudit) => {
        const nbDonnees = lieudit.inventaire
          .map((inventaire) => {
            return inventaire._count.donnee;
          })
          .reduce(counterReducer, 0);

        return {
          ...buildLieuditFromLieuditDb(lieudit),
          nbDonnees
        };
      });
    } else {
      const lieuxDitsRq = await prisma.lieudit.findMany({
        ...getPrismaPagination(searchParams),
        orderBy,
        include: {
          commune: {
            include: {
              departement: {
                select: {
                  id: true,
                  code: true,
                  ownerId: true
                }
              }
            }
          }
        },
        where: getFilterClause(searchParams?.q)
      });

      lieuxDits = lieuxDitsRq.map(buildLieuditFromLieuditDb);
    }
  }

  const count = await prisma.lieudit.count({
    where: getFilterClause(searchParams?.q)
  });

  return {
    result: lieuxDits,
    count
  };
};

export const upsertLieuDit = async (
  args: MutationUpsertLieuDitArgs,
  loggedUser: LoggedUser
): Promise<LieuDitWithCoordinatesAsNumber> => {
  const { id, data } = args;
  if (id) {
    return prisma.lieudit
      .update({
        where: { id },
        data
      })
      .then(buildLieuditFromLieuditDb);
  } else {
    return prisma.lieudit.create({ data: { ...data, ownerId: loggedUser.id } }).then(buildLieuditFromLieuditDb);
  }
};

export const deleteLieuDit = async (id: number): Promise<LieuDitWithCoordinatesAsNumber> => {
  return prisma.lieudit
    .delete({
      where: {
        id
      }
    })
    .then(buildLieuditFromLieuditDb);
};

export const createLieuxDits = async (
  lieuxDits: Omit<Prisma.LieuditCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.lieudit.createMany({
    data: lieuxDits.map((lieuDit) => {
      return { ...lieuDit, ownerId: loggedUser.id };
    })
  });
};
