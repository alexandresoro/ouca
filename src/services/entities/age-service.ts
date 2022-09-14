import { Age, DatabaseRole, Prisma } from "@prisma/client";
import { FindParams, MutationUpsertAgeArgs, QueryAgesArgs } from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  queryParametersToFindAllEntities,
} from "./entities-utils";

export const findAge = async (id: number, loggedUser: LoggedUser | null): Promise<Age | null> => {
  validateAuthorization(loggedUser);

  return prisma.age.findUnique({
    where: {
      id,
    },
  });
};

export const getDonneesCountByAge = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      ageId: id,
    },
  });
};

export const findAges = async (loggedUser: LoggedUser | null, params?: FindParams | null): Promise<Age[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  return prisma.age.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined,
      },
    },
    take: max || undefined,
  });
};

export const findPaginatedAges = async (
  loggedUser: LoggedUser | null = null,
  options: QueryAgesArgs = {}
): Promise<Age[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.AgeOrderByWithRelationInput> | undefined = undefined;
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

  return prisma.age.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getEntiteAvecLibelleFilterClause(searchParams?.q),
  });
};

export const getAgesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.age.count({
    where: getEntiteAvecLibelleFilterClause(q),
  });
};

export const upsertAge = async (args: MutationUpsertAgeArgs, loggedUser: LoggedUser): Promise<Age> => {
  const { id, data } = args;

  let upsertedAge: Age;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.age.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedAge = await prisma.age.update({
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
      upsertedAge = await prisma.age.create({
        data: {
          ...data,
          ownerId: loggedUser.id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return upsertedAge;
};

export const deleteAge = async (id: number, loggedUser: LoggedUser | null): Promise<Age> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.age.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.age.delete({
    where: {
      id,
    },
  });
};

export const createAges = async (
  ages: Omit<Prisma.AgeCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.age.createMany({
    data: ages.map((age) => {
      return { ...age, ownerId: loggedUser.id };
    }),
  });
};
