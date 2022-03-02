import { DatabaseRole, Prisma, Sexe } from "@prisma/client";
import { FindParams, MutationUpsertSexeArgs, QueryPaginatedSexesArgs, SexesPaginatedResult } from "../../model/graphql";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus
} from "./entities-utils";

export const findSexe = async (
  id: number,
  loggedUser: LoggedUser | null = null
): Promise<(Sexe & ReadonlyStatus) | null> => {
  const sexeEntity = await prisma.sexe.findUnique({
    where: {
      id
    }
  });

  if (!sexeEntity) {
    return null;
  }

  return {
    ...sexeEntity,
    readonly: isEntityReadOnly(sexeEntity, loggedUser)
  };
};

export const findSexes = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<(Sexe & ReadonlyStatus)[]> => {
  const { q, max } = params ?? {};

  const sexeEntities = await prisma.sexe.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined
      }
    },
    take: max || undefined
  });

  return sexeEntities?.map((sexe) => {
    return {
      ...sexe,
      readonly: isEntityReadOnly(sexe, loggedUser)
    };
  });
};

export const findPaginatedSexes = async (
  options: Partial<QueryPaginatedSexesArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<SexesPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let orderBy: Prisma.Enumerable<Prisma.SexeOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "libelle":
        orderBy = {
          [orderByField]: sortOrder
        };
        break;
      case "nbDonnees":
        {
          orderBy = {
            donnee: {
              _count: sortOrder
            }
          };
        }
        break;
      default:
        orderBy = {};
    }
  }

  let sexeEntities: (Sexe & { nbDonnees?: number })[];

  if (includeCounts) {
    const sexes = await prisma.sexe.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      include: {
        _count: {
          select: {
            donnee: true
          }
        }
      },
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });

    sexeEntities = sexes.map((sexe) => {
      return {
        ...sexe,
        nbDonnees: sexe._count.donnee
      };
    });
  } else {
    sexeEntities = await prisma.sexe.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });
  }

  const count = await prisma.sexe.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  const sexes = sexeEntities?.map((sexe) => {
    return {
      ...sexe,
      readonly: isEntityReadOnly(sexe, loggedUser)
    };
  });

  return {
    result: sexes,
    count
  };
};

export const upsertSexe = async (
  args: MutationUpsertSexeArgs,
  loggedUser: LoggedUser
): Promise<Sexe & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedSexe: Sexe;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.sexe.findFirst({
        where: { id }
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedSexe = await prisma.sexe.update({
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
    try {
      upsertedSexe = await prisma.sexe.create({
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
    ...upsertedSexe,
    readonly: false
  };
};

export const deleteSexe = async (id: number, loggedUser: LoggedUser): Promise<Sexe> => {
  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.sexe.findFirst({
      where: { id }
    });

    if (existingData?.ownerId !== loggedUser.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.sexe.delete({
    where: {
      id
    }
  });
};

export const createSexes = async (sexes: Omit<Sexe, "id">[]): Promise<Prisma.BatchPayload> => {
  // TODO add user ownership
  return prisma.sexe.createMany({
    data: sexes
  });
};
