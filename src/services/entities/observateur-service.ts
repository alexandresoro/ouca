import { Prisma, type Observateur } from "@prisma/client";
import {
  type FindParams,
  type MutationUpsertObservateurArgs,
  type QueryObservateursArgs,
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/LoggedUser";
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

export const findObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<Observateur | null> => {
  validateAuthorization(loggedUser);

  return prisma.observateur.findUnique({
    where: {
      id,
    },
  });
};

export const getDonneesCountByObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      inventaire: {
        observateurId: id,
      },
    },
  });
};

export const findObservateurs = async (
  loggedUser: LoggedUser | null,
  params?: FindParams | null
): Promise<Observateur[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  return prisma.observateur.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined,
      },
    },
    take: max || undefined,
  });
};

export const findPaginatedObservateurs = async (
  loggedUser: LoggedUser | null,
  options: QueryObservateursArgs = {}
): Promise<Observateur[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = orderByField === "nbDonnees";

  let observateurEntities: Observateur[];

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
      (Observateur & { nbDonnees: bigint })[]
    >`${donneesPerObservateurIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`.then(
      transformQueryRawResultsBigIntsToNumbers
    );
  } else {
    const orderBy = orderByField ? { [orderByField]: sortOrder } : {};

    observateurEntities = await prisma.observateur.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q),
    });
  }

  return observateurEntities;
};

export const getObservateursCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.observateur.count({
    where: getEntiteAvecLibelleFilterClause(q),
  });
};

export const upsertObservateur = async (
  args: MutationUpsertObservateurArgs,
  loggedUser: LoggedUser | null
): Promise<Observateur> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedObservateur: Observateur;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await prisma.observateur.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    try {
      upsertedObservateur = await prisma.observateur.update({
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
    // Create a new observer
    try {
      upsertedObservateur = await prisma.observateur.create({
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

  return upsertedObservateur;
};

export const deleteObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<Observateur> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== "admin") {
    const existingData = await prisma.observateur.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.observateur.delete({
    where: {
      id,
    },
  });
};

export const createObservateurs = async (
  observateurs: Omit<Prisma.ObservateurCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.observateur.createMany({
    data: observateurs.map((observateur) => {
      return { ...observateur, ownerId: loggedUser.id };
    }),
  });
};
