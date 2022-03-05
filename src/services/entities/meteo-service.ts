import { DatabaseRole, Meteo, Prisma } from "@prisma/client";
import {
  FindParams,
  MeteosPaginatedResult,
  MutationUpsertMeteoArgs,
  QueryPaginatedMeteosArgs
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus
} from "./entities-utils";

export const findMeteo = async (
  id: number,
  loggedUser: LoggedUser | null = null
): Promise<(Meteo & ReadonlyStatus) | null> => {
  const meteoEntity = await prisma.meteo.findUnique({
    where: {
      id
    }
  });

  if (!meteoEntity) {
    return null;
  }

  return {
    ...meteoEntity,
    readonly: isEntityReadOnly(meteoEntity, loggedUser)
  };
};

export const findMeteosByIds = async (
  ids: number[],
  loggedUser: LoggedUser | null = null
): Promise<(Meteo & ReadonlyStatus)[]> => {
  const meteoEntities = await prisma.meteo.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      id: {
        in: ids
      }
    }
  });

  return meteoEntities?.map((meteo) => {
    return {
      ...meteo,
      readonly: isEntityReadOnly(meteo, loggedUser)
    };
  });
};

export const findMeteos = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<(Meteo & ReadonlyStatus)[]> => {
  const { q, max } = params ?? {};

  const meteoEntities = await prisma.meteo.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined
      }
    },
    take: max || undefined
  });

  return meteoEntities?.map((meteo) => {
    return {
      ...meteo,
      readonly: isEntityReadOnly(meteo, loggedUser)
    };
  });
};

export const findPaginatedMeteos = async (
  options: Partial<QueryPaginatedMeteosArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<MeteosPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  const isNbDonneesNeeded = includeCounts || orderByField === "nbDonnees";

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
      (Meteo & { nbDonnees: number })[]
    >`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;
  } else {
    const orderBy = orderByField ? { [orderByField]: sortOrder } : {};

    meteoEntities = await prisma.meteo.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });
  }

  const count = await prisma.meteo.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  const meteos = meteoEntities?.map((meteo) => {
    return {
      ...meteo,
      readonly: isEntityReadOnly(meteo, loggedUser)
    };
  });

  return {
    result: meteos,
    count
  };
};

export const upsertMeteo = async (
  args: MutationUpsertMeteoArgs,
  loggedUser: LoggedUser
): Promise<Meteo & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedMeteo: Meteo;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.meteo.findFirst({
        where: { id }
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    try {
      upsertedMeteo = await prisma.meteo.update({
        where: { id },
        data
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
          ownerId: loggedUser.id
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return {
    ...upsertedMeteo,
    readonly: false
  };
};

export const deleteMeteo = async (id: number, loggedUser: LoggedUser): Promise<Meteo> => {
  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.meteo.findFirst({
      where: { id }
    });

    if (existingData?.ownerId !== loggedUser.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.meteo.delete({
    where: {
      id
    }
  });
};

export const createMeteos = async (
  meteos: Omit<Prisma.MeteoCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.meteo.createMany({
    data: meteos.map((meteo) => {
      return { ...meteo, ownerId: loggedUser.id };
    })
  });
};
