import { Prisma, type Milieu } from "@prisma/client";
import {
  type FindParams,
  type MutationUpsertMilieuArgs,
  type QueryMilieuxArgs,
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import numberAsCodeSqlMatcher from "../../utils/number-as-code-sql-matcher";
import { validateAuthorization } from "./authorization-utils";
import { getPrismaPagination, queryParametersToFindAllEntities } from "./entities-utils";

export const findMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<Milieu | null> => {
  validateAuthorization(loggedUser);

  return prisma.milieu.findUnique({
    where: {
      id,
    },
  });
};

export const getDonneesCountByMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.donnee.count({
    where: {
      donnee_milieu: {
        some: {
          milieu_id: id,
        },
      },
    },
  });
};

export const findMilieux = async (loggedUser: LoggedUser | null, params?: FindParams | null): Promise<Milieu[]> => {
  validateAuthorization(loggedUser);

  const { q, max } = params ?? {};

  const matchingCodesAsNumber = numberAsCodeSqlMatcher(q);
  const matchingCodesAsNumberClause = matchingCodesAsNumber.map((matchingCode) => {
    return {
      code: {
        startsWith: matchingCode,
      },
    };
  });

  const matchingWithCode = await prisma.milieu.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: q
      ? {
          OR: [
            ...matchingCodesAsNumberClause,
            {
              code: {
                startsWith: q, // It can happen that codes are a mix of numbers+letters (e.g. 22A0)
              },
            },
          ],
        }
      : undefined,
    take: max || undefined,
  });

  const matchingWithLibelle = await prisma.milieu.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      libelle: {
        contains: q || undefined,
      },
    },
    take: max || undefined,
  });

  // Concatenate arrays and remove elements that could be present in several indexes, to keep a unique reference
  // This is done like this to be consistent with what was done previously on UI side:
  // code had a weight of 1, and libelle had no weight, so we don't "return first" the elements that appear multiple time
  // However, to be consistent, we still need to sort them by code as it can still be mixed up
  const matchingEntries = [...matchingWithCode, ...matchingWithLibelle]
    .sort((a, b) => a.code.localeCompare(b.code))
    .filter((element, index, self) => index === self.findIndex((eltArray) => eltArray.id === element.id));

  return max ? matchingEntries.slice(0, max) : matchingEntries;
};

const getFilterClause = (q: string | null | undefined): Prisma.MilieuWhereInput => {
  return q != null && q.length
    ? {
        OR: [
          {
            code: {
              contains: q,
            },
          },
          {
            libelle: {
              contains: q,
            },
          },
        ],
      }
    : {};
};

export const findPaginatedMilieux = async (
  loggedUser: LoggedUser | null,
  options: Partial<QueryMilieuxArgs> = {}
): Promise<Milieu[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.MilieuOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "code":
      case "libelle":
        orderBy = {
          [orderByField]: sortOrder,
        };
        break;
      case "nbDonnees":
        orderBy = {
          donnee_milieu: {
            _count: sortOrder,
          },
        };
        break;
      default:
        orderBy = {};
    }
  }

  return prisma.milieu.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getFilterClause(searchParams?.q),
  });
};

export const getMilieuxCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.milieu.count({
    where: getFilterClause(q),
  });
};

export const upsertMilieu = async (args: MutationUpsertMilieuArgs, loggedUser: LoggedUser | null): Promise<Milieu> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedMilieu: Milieu;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await prisma.milieu.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing milieu
    try {
      upsertedMilieu = await prisma.milieu.update({
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
    // Create a new milieu
    try {
      upsertedMilieu = await prisma.milieu.create({ data: { ...data, ownerId: loggedUser?.id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return upsertedMilieu;
};

export const deleteMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<Milieu> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== "admin") {
    const existingData = await prisma.milieu.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.milieu.delete({
    where: {
      id,
    },
  });
};

export const createMilieux = async (
  milieux: Omit<Prisma.MilieuCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.milieu.createMany({
    data: milieux.map((milieu) => {
      return { ...milieu, ownerId: loggedUser.id };
    }),
  });
};
