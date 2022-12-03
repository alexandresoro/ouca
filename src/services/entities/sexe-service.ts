import { Prisma } from "@prisma/client";
import {
  type FindParams,
  type MutationUpsertSexeArgs,
  type QuerySexesArgs,
} from "../../graphql/generated/graphql-types";
import { type Sexe } from "../../repositories/sexe/sexe-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  queryParametersToFindAllEntities,
} from "./entities-utils";

export const findSexe = async (id: number, loggedUser: LoggedUser | null): Promise<Sexe | null> => {
  validateAuthorization(loggedUser);

  return prisma.sexe.findUnique({
    where: {
      id,
    },
  });
};

export const getDonneesCountBySexe = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      sexeId: id,
    },
  });
};

export const findSexes = async (loggedUser: LoggedUser | null, params?: FindParams | null): Promise<Sexe[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  return prisma.sexe.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined,
      },
    },
    take: max || undefined,
  });
};

export const findPaginatedSexes = async (
  loggedUser: LoggedUser | null,
  options: Partial<QuerySexesArgs> = {}
): Promise<Sexe[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.SexeOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "libelle":
        orderBy = {
          [orderByField]: sortOrder,
        };
        break;
      case "nbDonnees":
        {
          orderBy = {
            donnee: {
              _count: sortOrder,
            },
          };
        }
        break;
      default:
        orderBy = {};
    }
  }

  return prisma.sexe.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getEntiteAvecLibelleFilterClause(searchParams?.q),
  });
};

export const getSexesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.sexe.count({
    where: getEntiteAvecLibelleFilterClause(q),
  });
};

export const upsertSexe = async (args: MutationUpsertSexeArgs, loggedUser: LoggedUser | null): Promise<Sexe> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedSexe: Sexe;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await prisma.sexe.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedSexe = await prisma.sexe.update({
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
    try {
      upsertedSexe = await prisma.sexe.create({
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

  return upsertedSexe;
};

export const deleteSexe = async (id: number, loggedUser: LoggedUser | null): Promise<Sexe> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== "admin") {
    const existingData = await prisma.sexe.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.sexe.delete({
    where: {
      id,
    },
  });
};

export const createSexes = async (
  sexes: Omit<Prisma.SexeCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.sexe.createMany({
    data: sexes.map((sexe) => {
      return { ...sexe, ownerId: loggedUser.id };
    }),
  });
};
