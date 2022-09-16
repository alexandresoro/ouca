import { DatabaseRole, EstimationNombre, Prisma } from "@prisma/client";
import {
  FindParams,
  MutationUpsertEstimationNombreArgs,
  QueryEstimationsNombreArgs,
} from "../../graphql/generated/graphql-types";
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

export const findEstimationNombre = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<EstimationNombre | null> => {
  validateAuthorization(loggedUser);

  return prisma.estimationNombre.findUnique({
    where: {
      id,
    },
  });
};

export const getDonneesCountByEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      estimationNombreId: id,
    },
  });
};

export const findEstimationsNombre = async (
  loggedUser: LoggedUser | null,
  params?: FindParams | null
): Promise<EstimationNombre[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  return prisma.estimationNombre.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        startsWith: q || undefined,
      },
    },
    take: max || undefined,
  });
};

export const findPaginatedEstimationsNombre = async (
  loggedUser: LoggedUser | null,
  options: Partial<QueryEstimationsNombreArgs> = {}
): Promise<EstimationNombre[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EstimationNombreOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "libelle":
      case "nonCompte":
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

  return prisma.estimationNombre.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getEntiteAvecLibelleFilterClause(searchParams?.q),
  });
};

export const getEstimationsNombreCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.estimationNombre.count({
    where: getEntiteAvecLibelleFilterClause(q),
  });
};

export const upsertEstimationNombre = async (
  args: MutationUpsertEstimationNombreArgs,
  loggedUser: LoggedUser | null
): Promise<EstimationNombre> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedEstimationNombre: EstimationNombre;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.estimationNombre.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedEstimationNombre = await prisma.estimationNombre.update({
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
      upsertedEstimationNombre = await prisma.estimationNombre.create({
        data: { ...data, ownerId: loggedUser?.id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return upsertedEstimationNombre;
};

export const deleteEstimationNombre = async (id: number, loggedUser: LoggedUser | null): Promise<EstimationNombre> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.estimationNombre.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.estimationNombre.delete({
    where: {
      id,
    },
  });
};

export const createEstimationsNombre = async (
  estimationsNombre: Omit<Prisma.EstimationNombreCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.estimationNombre.createMany({
    data: estimationsNombre.map((estimationNombre) => {
      return { ...estimationNombre, ownerId: loggedUser.id };
    }),
  });
};
