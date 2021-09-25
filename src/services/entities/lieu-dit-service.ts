import { Prisma } from ".prisma/client";
import { areSameCoordinates } from "../../model/coordinates-system/coordinates-helper";
import { LieuDit, LieuDitWithCounts, LieuxDitsPaginatedResult, QueryPaginatedLieuxditsArgs } from "../../model/graphql";
import { Coordinates } from "../../model/types/coordinates.object";
import { Lieudit } from "../../model/types/lieudit.model";
import { LieuditDb } from "../../objects/db/lieudit-db.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { buildLieuditDbFromLieudit, buildLieuditFromLieuditDb } from "../../sql/entities-mapping/lieudit-mapping";
import prisma from "../../sql/prisma";
import { queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_NOM, TABLE_LIEUDIT } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getFilterClauseCommune } from "./commune-service";
import { getPrismaPagination, getSqlPagination, getSqlSorting } from "./entities-utils";
import { insertMultipleEntitiesNoCheck, persistEntityNoCheck } from "./entity-service";

export const findLieuxDits = async (): Promise<LieuDit[]> => {
  return prisma.lieudit.findMany({
    orderBy: {
      nom: "asc"
    }
  }).then(lieuxDits => lieuxDits.map(lieuDit => {
    const { commune_id, coordinates_system, latitude, longitude, ...others } = lieuDit;
    return {
      ...others,
      latitude: latitude.toNumber(),
      longitude: longitude.toNumber(),
      coordinatesSystem: coordinates_system,
      communeId: commune_id,
    }
  }));
};

const getFilterClause = (q: string | null | undefined): Prisma.LieuditWhereInput => {
  return (q != null && q.length) ? {
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
  } : {};
}


export const findAllLieuxDits = async (options?: {
  where?: Prisma.LieuditWhereInput
}): Promise<LieuDit[]> => {
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
    const nbDonnees = lieudit.inventaire.map(inventaire => {
      return inventaire._count.donnee;
    }).reduce(counterReducer, 0);

    const { commune_id, coordinates_system, latitude, longitude, ...others } = lieudit

    return {
      ...others,
      communeId: commune_id,
      coordinatesSystem: coordinates_system,
      longitude: longitude.toNumber(),
      latitude: latitude.toNumber(),
      nbDonnees
    }
  });
};

export const findPaginatedLieuxDits = async (
  options: QueryPaginatedLieuxditsArgs = {},
  includeCounts = true
): Promise<LieuxDitsPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let lieuxDits: LieuDitWithCounts[];

  if (orderByField === "nbDonnees") {

    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression ? Prisma.sql`
    WHERE
      l.nom LIKE ${queryExpression}
    OR
      c.nom LIKE ${queryExpression}
    OR
      dpt.code LIKE ${queryExpression}
    ` : Prisma.empty;

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
    `

    const nbDonneesForFilteredLieuxDits = await prisma.$queryRaw<({ id: number, nbDonnees: number })[]>`${donneesPerLieuDitRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

    const lieuxDitsRq = await prisma.lieudit.findMany({
      include: {
        commune: {
          include: {
            departement: {
              select: {
                id: true,
                code: true
              }
            }
          }
        }
      },
      where: {
        id: {
          in: nbDonneesForFilteredLieuxDits.map(lieuditInfo => lieuditInfo.id) // /!\ The IN clause could break if not paginated enough
        }
      }
    });

    lieuxDits = nbDonneesForFilteredLieuxDits.map((lieuditInfo) => {
      const lieudit = lieuxDitsRq?.find(lieudit => lieudit.id === lieuditInfo.id);

      const { latitude, longitude, coordinates_system, ...otherFields } = lieudit;
      return {
        ...otherFields,
        latitude: latitude.toNumber(),
        longitude: longitude.toNumber(),
        coordinatesSystem: coordinates_system,
        nbDonnees: lieuditInfo.nbDonnees
      };
    })

  } else {

    let orderBy: Prisma.Enumerable<Prisma.LieuditOrderByWithRelationInput>;
    switch (orderByField) {
      case "id":
      case "nom":
      case "altitude":
      case "longitude":
      case "latitude":
        orderBy = {
          [orderByField]: sortOrder
        }
        break;
      case "codeCommune":
        orderBy = sortOrder && {
          commune: {
            code: sortOrder
          }
        }
        break;
      case "nomCommune":
        orderBy = sortOrder && {
          commune: {
            nom: sortOrder
          }
        }
        break;
      case "departement":
        orderBy = sortOrder && {
          commune: {
            departement: {
              code: sortOrder
            }
          }
        }
        break;
      default:
        orderBy = {}
    }

    const lieuxDitsRq = await prisma.lieudit.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      include: {
        commune: {
          include: {
            departement: {
              select: {
                id: true,
                code: true
              }
            }
          }
        },
        inventaire: includeCounts && {
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

      const nbDonnees = includeCounts && lieudit.inventaire.map(inventaire => {
        return inventaire._count.donnee;
      }).reduce(counterReducer, 0);

      const { latitude, longitude, coordinates_system, ...otherFields } = lieudit;
      return {
        ...otherFields,
        latitude: latitude.toNumber(),
        longitude: longitude.toNumber(),
        coordinatesSystem: coordinates_system,
        nbDonnees
      };
    })

  }

  const count = await prisma.lieudit.count({
    where: getFilterClause(searchParams?.q)
  });

  return {
    result: lieuxDits,
    count
  }
};

export const findLieuDitById = async (lieuditId: number): Promise<Lieudit> => {
  const lieuDitDb = await prisma.lieudit.findFirst({
    where: {
      id: lieuditId
    }
  });

  return buildLieuditFromLieuditDb(lieuDitDb);
};

const getCoordinatesToPersist = async (
  lieuDit: Lieudit
): Promise<Coordinates> => {
  const newCoordinates = lieuDit.coordinates;

  let coordinatesToPersist = newCoordinates;

  if (lieuDit.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldLieuDit = await findLieuDitById(lieuDit.id);

    if (areSameCoordinates(oldLieuDit?.coordinates, newCoordinates)) {
      coordinatesToPersist = oldLieuDit.coordinates;
    }
  }

  return coordinatesToPersist;
};

export const persistLieuDit = async (
  lieuDit: Lieudit
): Promise<SqlSaveResponse> => {
  if (Object.prototype.hasOwnProperty.call(lieuDit, "coordinates")) {
    lieuDit.coordinates = await getCoordinatesToPersist(lieuDit);
  }

  const lieuditDb = buildLieuditDbFromLieudit(lieuDit);

  return persistEntityNoCheck(TABLE_LIEUDIT, lieuditDb);
};

export const insertLieuxDits = async (
  lieuxDits: LieuditDb[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntitiesNoCheck(TABLE_LIEUDIT, lieuxDits);
};