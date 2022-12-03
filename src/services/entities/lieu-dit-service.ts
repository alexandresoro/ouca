import { Prisma, type Lieudit } from "@prisma/client";
import {
  type FindParams,
  type MutationUpsertLieuDitArgs,
  type QueryLieuxDitsArgs,
} from "../../graphql/generated/graphql-types";
import { type Commune } from "../../repositories/commune/commune-repository-types";
import { type Departement } from "../../repositories/departement/departement-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { COLUMN_NOM } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getFilterClauseCommune } from "./commune-service";
import {
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  queryParametersToFindAllEntities,
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
  loggedUser: LoggedUser | null
): Promise<LieuDitWithCoordinatesAsNumber | null> => {
  validateAuthorization(loggedUser);

  return prisma.lieudit
    .findUnique({
      where: {
        id,
      },
    })
    .then((lieudit) => (lieudit ? buildLieuditFromLieuditDb(lieudit) : null));
};

export const getDonneesCountByLieuDit = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      inventaire: {
        lieuDitId: id,
      },
    },
  });
};

export const findLieuDitOfInventaireId = async (
  inventaireId: number | undefined,
  loggedUser: LoggedUser | null = null
): Promise<Lieudit | null> => {
  return prisma.inventaire
    .findUnique({
      where: {
        id: inventaireId,
      },
    })
    .lieuDit();
};

export const findLieuxDits = async (
  loggedUser: LoggedUser | null,
  options: {
    params?: FindParams | null;
    communeId?: number | null;
    departementId?: number | null;
  } = {}
): Promise<Omit<LieuDitWithCoordinatesAsNumber, "commune">[]> => {
  validateAuthorization(loggedUser);

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

  return prisma.lieudit
    .findMany({
      ...queryParametersToFindAllEntities(COLUMN_NOM),
      where: whereClause,
      take: max || undefined,
    })
    .then((lieuxDits) => lieuxDits.map(buildLieuditFromLieuditDb));
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
  loggedUser: LoggedUser | null,
  options: Partial<QueryLieuxDitsArgs> = {}
): Promise<LieuDitWithCoordinatesAsNumber<Lieudit>[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let lieuxDitsEntities: LieuDitWithCoordinatesAsNumber<Lieudit>[];

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
      where: {
        id: {
          in: nbDonneesForFilteredLieuxDits.map((lieuditInfo) => lieuditInfo.id), // /!\ The IN clause could break if not paginated enough
        },
      },
    });

    lieuxDitsEntities = nbDonneesForFilteredLieuxDits.map((lieuditInfo) => {
      const lieudit = lieuxDitsRq?.find((lieudit) => lieudit.id === lieuditInfo.id);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return buildLieuditFromLieuditDb(lieudit!);
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

    const lieuxDitsRq = await prisma.lieudit.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getFilterClause(searchParams?.q),
    });

    lieuxDitsEntities = lieuxDitsRq.map(buildLieuditFromLieuditDb);
  }

  return lieuxDitsEntities;
};

export const getLieuxDitsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.lieudit.count({
    where: getFilterClause(q),
  });
};

export const upsertLieuDit = async (
  args: MutationUpsertLieuDitArgs,
  loggedUser: LoggedUser | null
): Promise<LieuDitWithCoordinatesAsNumber> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedLieuDit: LieuDitWithCoordinatesAsNumber;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await prisma.lieudit.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
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
        .create({ data: { ...data, ownerId: loggedUser?.id } })
        .then(buildLieuditFromLieuditDb);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return upsertedLieuDit;
};

export const deleteLieuDit = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<LieuDitWithCoordinatesAsNumber> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== "admin") {
    const existingData = await prisma.lieudit.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
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
