import { Age, DatabaseRole, Prisma } from "@prisma/client";
import { AgesPaginatedResult, FindParams, MutationUpsertAgeArgs, QueryPaginatedAgesArgs } from "../../model/graphql";
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

export const findAge = async (
  id: number,
  loggedUser: LoggedUser | null = null
): Promise<(Age & ReadonlyStatus) | null> => {
  const ageEntity = await prisma.age.findUnique({
    where: {
      id
    }
  });

  if (!ageEntity) {
    return null;
  }

  return {
    ...ageEntity,
    readonly: isEntityReadOnly(ageEntity, loggedUser)
  };
};

export const findAges = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<(Age & ReadonlyStatus)[]> => {
  const { q, max } = params ?? {};

  const ageEntities = await prisma.age.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined
      }
    },
    take: max || undefined
  });

  return ageEntities?.map((age) => {
    return {
      ...age,
      readonly: isEntityReadOnly(age, loggedUser)
    };
  });
};

export const findPaginatedAges = async (
  options: Partial<QueryPaginatedAgesArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<AgesPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let orderBy: Prisma.Enumerable<Prisma.AgeOrderByWithRelationInput> | undefined = undefined;
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

  let ageEntities: (Age & { nbDonnees?: number })[];

  if (includeCounts) {
    const ages = await prisma.age.findMany({
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

    ageEntities = ages.map((age) => {
      return {
        ...age,
        nbDonnees: age._count.donnee
      };
    });
  } else {
    ageEntities = await prisma.age.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    });
  }

  const count = await prisma.age.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  const ages = ageEntities?.map((age) => {
    return {
      ...age,
      readonly: isEntityReadOnly(age, loggedUser)
    };
  });

  return {
    result: ages,
    count
  };
};

export const upsertAge = async (args: MutationUpsertAgeArgs, loggedUser: LoggedUser): Promise<Age & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedAge: Age;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.age.findFirst({
        where: { id }
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      upsertedAge = await prisma.age.update({
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
      upsertedAge = await prisma.age.create({
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
    ...upsertedAge,
    readonly: false
  };
};

export const deleteAge = async (id: number, loggedUser: LoggedUser): Promise<Age> => {
  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.age.findFirst({
      where: { id }
    });

    if (existingData?.ownerId !== loggedUser.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.age.delete({
    where: {
      id
    }
  });
};

export const createAges = async (
  ages: Omit<Prisma.AgeCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.age.createMany({
    data: ages.map((age) => {
      return { ...age, ownerId: loggedUser.id };
    })
  });
};
