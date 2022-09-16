import { DatabaseRole, Meteo, Prisma } from "@prisma/client";
import { FindParams, MutationUpsertMeteoArgs, QueryMeteosArgs } from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  queryParametersToFindAllEntities,
  transformQueryRawResultsBigIntsToNumbers,
} from "./entities-utils";

export const findMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<Meteo | null> => {
  validateAuthorization(loggedUser);

  return prisma.meteo.findUnique({
    where: {
      id,
    },
  });
};

export const getDonneesCountByMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      inventaire: {
        inventaire_meteo: {
          some: {
            meteo_id: id,
          },
        },
      },
    },
  });
};

export const findMeteosByIds = async (ids: number[], loggedUser: LoggedUser | null = null): Promise<Meteo[]> => {
  return prisma.meteo.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      id: {
        in: ids,
      },
    },
  });
};

export const findMeteos = async (loggedUser: LoggedUser | null, params?: FindParams | null): Promise<Meteo[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  return prisma.meteo.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined,
      },
    },
    take: max || undefined,
  });
};

export const findPaginatedMeteos = async (
  loggedUser: LoggedUser | null,
  options: Partial<QueryMeteosArgs> = {}
): Promise<Meteo[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = orderByField === "nbDonnees";

  let meteoEntities: (Meteo & { nbDonnees?: number })[];

  if (isNbDonneesNeeded) {
    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression
      ? Prisma.sql`
    WHERE
      libelle LIKE ${queryExpression}
    `
      : Prisma.empty;

    const donneesPerObservateurIdRequest = Prisma.sql`
    SELECT 
      m.*, m.owner_id as ownerId, count(d.id) as nbDonnees
    FROM 
      donnee d 
    RIGHT JOIN 
      inventaire i
    ON 
      d.inventaire_id = i.id 
    RIGHT JOIN
      inventaire_meteo im
    ON
      im.inventaire_id = i.id
    RIGHT JOIN
      meteo m
    ON
      m.id = im.meteo_id
    ${filterRequest}
    GROUP BY 
      m.id
    `;

    meteoEntities = await prisma.$queryRaw<
      (Meteo & { nbDonnees: bigint })[]
    >`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`.then(
      transformQueryRawResultsBigIntsToNumbers
    );
  } else {
    const orderBy = orderByField ? { [orderByField]: sortOrder } : {};

    meteoEntities = await prisma.meteo.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q),
    });
  }

  return meteoEntities;
};

export const getMeteosCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.meteo.count({
    where: getEntiteAvecLibelleFilterClause(q),
  });
};

export const upsertMeteo = async (args: MutationUpsertMeteoArgs, loggedUser: LoggedUser | null): Promise<Meteo> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedMeteo: Meteo;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.meteo.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    try {
      upsertedMeteo = await prisma.meteo.update({
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
    // Create a new meteo
    try {
      upsertedMeteo = await prisma.meteo.create({
        data: {
          ...data,
          ownerId: loggedUser?.id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return upsertedMeteo;
};

export const deleteMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<Meteo> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.meteo.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.meteo.delete({
    where: {
      id,
    },
  });
};

export const createMeteos = async (
  meteos: Omit<Prisma.MeteoCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.meteo.createMany({
    data: meteos.map((meteo) => {
      return { ...meteo, ownerId: loggedUser.id };
    }),
  });
};
