import { DatabaseRole, Observateur, Prisma } from "@prisma/client";
import {
  FindParams,
  MutationUpsertObservateurArgs,
  ObservateursPaginatedResult,
  QueryPaginatedObservateursArgs
} from "../../graphql/generated/graphql-types";
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

export const findObservateur = async (
  id: number,
  loggedUser: LoggedUser | null = null
): Promise<(Observateur & ReadonlyStatus) | null> => {
  const observateurEntity = await prisma.observateur.findUnique({
    where: {
      id
    }
  });

  if (!observateurEntity) {
    return null;
  }

  return {
    ...observateurEntity,
    readonly: isEntityReadOnly(observateurEntity, loggedUser)
  };
};

export const findObservateursByIds = async (
  ids: number[],
  loggedUser: LoggedUser | null = null
): Promise<(Observateur & ReadonlyStatus)[]> => {
  const observateurEntities = await prisma.observateur.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      id: {
        in: ids
      }
    }
  });

  return observateurEntities?.map((observateur) => {
    return {
      ...observateur,
      readonly: isEntityReadOnly(observateur, loggedUser)
    };
  });
};

export const findObservateurs = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<(Observateur & ReadonlyStatus)[]> => {
  const { q, max } = params ?? {};

  const observateurEntities = await prisma.observateur.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined
      }
    },
    take: max || undefined
  });

  return observateurEntities?.map((observateur) => {
    return {
      ...observateur,
      readonly: isEntityReadOnly(observateur, loggedUser)
    };
  });
};

export const findPaginatedObservateurs = async (
  options: Partial<QueryPaginatedObservateursArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<ObservateursPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  const isNbDonneesNeeded = includeCounts || orderByField === "nbDonnees";

  let observateurEntities: (Observateur & { nbDonnees?: number })[];

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
      o.*, o.owner_id as ownerId, count(d.id) as nbDonnees
    FROM 
      donnee d 
    RIGHT JOIN 
      inventaire i
    ON 
      d.inventaire_id = i.id 
    RIGHT JOIN
      observateur o
    ON
      i.observateur_id = o.id
    ${filterRequest}
    GROUP BY 
      o.id
    `;

    observateurEntities = await prisma.$queryRaw<
      (Observateur & { nbDonnees: number })[]
    >`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;
  } else {
    const orderBy = orderByField ? { [orderByField]: sortOrder } : {};

    observateurEntities = await prisma.observateur.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });
  }

  const count = await prisma.observateur.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  const observateurs = observateurEntities?.map((observateur) => {
    return {
      ...observateur,
      readonly: isEntityReadOnly(observateur, loggedUser)
    };
  });

  return {
    result: observateurs,
    count
  };
};

export const upsertObservateur = async (
  args: MutationUpsertObservateurArgs,
  loggedUser: LoggedUser
): Promise<Observateur & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedObservateur: Observateur;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.observateur.findFirst({
        where: { id }
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    try {
      upsertedObservateur = await prisma.observateur.update({
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
    // Create a new observer
    try {
      upsertedObservateur = await prisma.observateur.create({
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
    ...upsertedObservateur,
    readonly: false
  };
};

export const deleteObservateur = async (id: number, loggedUser: LoggedUser): Promise<Observateur> => {
  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.observateur.findFirst({
      where: { id }
    });

    if (existingData?.ownerId !== loggedUser.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.observateur.delete({
    where: {
      id
    }
  });
};

export const createObservateurs = async (
  observateurs: Omit<Prisma.ObservateurCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.observateur.createMany({
    data: observateurs.map((observateur) => {
      return { ...observateur, ownerId: loggedUser.id };
    })
  });
};
