import { Commune, DatabaseRole, Departement, Lieudit, Prisma } from "@prisma/client";
import {
  FindParams,
  LieuxDitsPaginatedResult,
  MutationUpsertLieuDitArgs,
  QueryPaginatedLieuxditsArgs,
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_NOM } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { OucaError } from "../../utils/errors";
import { getFilterClauseCommune } from "./commune-service";
import {
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus,
  transformQueryRawResultsBigIntsToNumbers,
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
    latitude: latitude.toNumber(),
  };
};

export const findLieuDit = async (
  id: number | undefined,
  loggedUser: LoggedUser | null = null
): Promise<(LieuDitWithCoordinatesAsNumber & ReadonlyStatus) | null> => {
  const lieuDitEntity = await prisma.lieudit
    .findUnique({
      where: {
        id,
      },
    })
    .then((lieudit) => (lieudit ? buildLieuditFromLieuditDb(lieudit) : null));

  if (!lieuDitEntity) {
    return null;
  }

  return {
    ...lieuDitEntity,
    readonly: isEntityReadOnly(lieuDitEntity, loggedUser),
  };
};

export const findLieuDitOfInventaireId = async (
  inventaireId: number | undefined,
  loggedUser: LoggedUser | null = null
): Promise<(Lieudit & ReadonlyStatus) | null> => {
  const lieuditEntity = await prisma.inventaire
    .findUnique({
      where: {
        id: inventaireId,
      },
    })
    .lieuDit();

  if (!lieuditEntity) {
    return null;
  }

  return {
    ...lieuditEntity,
    readonly: isEntityReadOnly(lieuditEntity, loggedUser),
  };
};

export const findLieuxDits = async (
  options: {
    params?: FindParams | null;
    communeId?: number | null;
    departementId?: number | null;
  } = {},
  loggedUser: LoggedUser | null = null
): Promise<Omit<LieuDitWithCoordinatesAsNumber, "commune">[]> => {
  const { params, communeId, departementId } = options;
  const { q, max } = params ?? {};

  const whereClause = {
    AND: [
      {
        nom: {
          contains: q || undefined,
        },
      },
      departementId
        ? {
            commune: {
              departementId: {
                equals: departementId,
              },
            },
          }
        : {},
      communeId
        ? {
            communeId: {
              equals: communeId,
            },
          }
        : {},
    ],
  };

  const lieuDitEntities = await prisma.lieudit
    .findMany({
      ...queryParametersToFindAllEntities(COLUMN_NOM),
      where: whereClause,
      take: max || undefined,
    })
    .then((lieuxDits) => lieuxDits.map(buildLieuditFromLieuditDb));

  return lieuDitEntities?.map((lieuDit) => {
    return {
      ...lieuDit,
      readonly: isEntityReadOnly(lieuDit, loggedUser),
    };
  });
};

const getFilterClause = (q: string | null | undefined): Prisma.LieuditWhereInput => {
  return q != null && q.length
    ? {
        OR: [
          {
            nom: {
              contains: q,
            },
          },
          {
            commune: getFilterClauseCommune(q),
          },
        ],
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
          departement: true,
        },
      },
    },
  });

  return lieuxDitsDb.map(buildLieuditFromLieuditDb);
};

export const findPaginatedLieuxDits = async (
  options: Partial<QueryPaginatedLieuxditsArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<LieuxDitsPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let lieuxDitsEntities: (LieuDitWithCoordinatesAsNumber<Lieudit> & {
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
      l.id, l.owner_id as ownerId, count(d.id) as nbDonnees
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
      { id: number; nbDonnees: bigint }[]
    >`${donneesPerLieuDitRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`.then(
      transformQueryRawResultsBigIntsToNumbers
    );

    const lieuxDitsRq = await prisma.lieudit.findMany({
      include: {
        commune: {
          include: {
            departement: {
              select: {
                id: true,
                code: true,
                ownerId: true,
              },
            },
          },
        },
      },
      where: {
        id: {
          in: nbDonneesForFilteredLieuxDits.map((lieuditInfo) => lieuditInfo.id), // /!\ The IN clause could break if not paginated enough
        },
      },
    });

    lieuxDitsEntities = nbDonneesForFilteredLieuxDits.map((lieuditInfo) => {
      const lieudit = lieuxDitsRq?.find((lieudit) => lieudit.id === lieuditInfo.id);

      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...buildLieuditFromLieuditDb(lieudit!),
        nbDonnees: lieuditInfo.nbDonnees,
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
            [orderByField]: sortOrder,
          };
          break;
        case "codeCommune":
          orderBy = {
            commune: {
              code: sortOrder,
            },
          };
          break;
        case "nomCommune":
          orderBy = {
            commune: {
              nom: sortOrder,
            },
          };
          break;
        case "departement":
          orderBy = {
            commune: {
              departement: {
                code: sortOrder,
              },
            },
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
                  ownerId: true,
                },
              },
            },
          },
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
        where: getFilterClause(searchParams?.q),
      });

      lieuxDitsEntities = lieuxDitsRq.map((lieudit) => {
        const nbDonnees = lieudit.inventaire
          .map((inventaire) => {
            return inventaire._count.donnee;
          })
          .reduce(counterReducer, 0);

        return {
          ...buildLieuditFromLieuditDb(lieudit),
          nbDonnees,
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
                  ownerId: true,
                },
              },
            },
          },
        },
        where: getFilterClause(searchParams?.q),
      });

      lieuxDitsEntities = lieuxDitsRq.map(buildLieuditFromLieuditDb);
    }
  }

  const count = await prisma.lieudit.count({
    where: getFilterClause(searchParams?.q),
  });

  const lieuxDits = lieuxDitsEntities?.map((lieuDit) => {
    return {
      ...lieuDit,
      readonly: isEntityReadOnly(lieuDit, loggedUser),
    };
  });

  return {
    result: lieuxDits,
    count,
  };
};

export const upsertLieuDit = async (
  args: MutationUpsertLieuDitArgs,
  loggedUser: LoggedUser
): Promise<LieuDitWithCoordinatesAsNumber & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedLieuDit: LieuDitWithCoordinatesAsNumber;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.lieudit.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedLieuDit = await prisma.lieudit
        .update({
          where: { id },
          data,
        })
        .then(buildLieuditFromLieuditDb);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  } else {
    try {
      upsertedLieuDit = await prisma.lieudit
        .create({ data: { ...data, ownerId: loggedUser.id } })
        .then(buildLieuditFromLieuditDb);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return {
    ...upsertedLieuDit,
    readonly: false,
  };
};

export const deleteLieuDit = async (id: number, loggedUser: LoggedUser): Promise<LieuDitWithCoordinatesAsNumber> => {
  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.lieudit.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.lieudit
    .delete({
      where: {
        id,
      },
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
    }),
  });
};
