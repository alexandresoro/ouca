import { DatabaseRole, Milieu, Prisma } from "@prisma/client";
import { FindParams, MutationUpsertMilieuArgs, QueryPaginatedMilieuxArgs } from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import numberAsCodeSqlMatcher from "../../utils/number-as-code-sql-matcher";
import { validateAuthorization } from "./authorization-utils";
import {
  getPrismaPagination,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus,
} from "./entities-utils";

export const findMilieu = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<(Milieu & ReadonlyStatus) | null> => {
  validateAuthorization(loggedUser);

  const milieuEntity = await prisma.milieu.findUnique({
    where: {
      id,
    },
  });

  if (!milieuEntity) {
    return null;
  }

  return {
    ...milieuEntity,
    readonly: isEntityReadOnly(milieuEntity, loggedUser),
  };
};

export const findMilieuxByIds = async (
  ids: number[],
  loggedUser: LoggedUser | null = null
): Promise<(Milieu & ReadonlyStatus)[]> => {
  const milieuxEntities = await prisma.milieu.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      id: {
        in: ids,
      },
    },
  });

  return milieuxEntities?.map((milieu) => {
    return {
      ...milieu,
      readonly: isEntityReadOnly(milieu, loggedUser),
    };
  });
};

export const findMilieux = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<(Milieu & ReadonlyStatus)[]> => {
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
    .filter((element, index, self) => index === self.findIndex((eltArray) => eltArray.id === element.id))
    .map((matchingEntry) => {
      return {
        ...matchingEntry,
        readonly: isEntityReadOnly(matchingEntry, loggedUser),
      };
    });

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
  options: Partial<QueryPaginatedMilieuxArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<Milieu[]> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

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

  const milieux = await prisma.milieu.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getFilterClause(searchParams?.q),
  });

  const donneesByMilieu = includeCounts
    ? await prisma.donnee_milieu.groupBy({
        by: ["milieu_id"],
        where: {
          milieu_id: {
            in: milieux?.map((milieu) => milieu.id),
          },
        },
        _count: true,
      })
    : null;

  return milieux.map((milieu) => {
    return {
      ...milieu,
      readonly: isEntityReadOnly(milieu, loggedUser),
      ...(includeCounts
        ? {
            nbDonnees: donneesByMilieu?.find((donneeByMilieu) => donneeByMilieu.milieu_id === milieu.id)?._count ?? 0,
          }
        : {}),
    };
  });
};

export const getMilieuxCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.milieu.count({
    where: getFilterClause(q),
  });
};

export const upsertMilieu = async (
  args: MutationUpsertMilieuArgs,
  loggedUser: LoggedUser | null
): Promise<Milieu & ReadonlyStatus> => {
  validateAuthorization(loggedUser);

  const { id, data } = args;

  let upsertedMilieu: Milieu;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
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

  return {
    ...upsertedMilieu,
    readonly: false,
  };
};

export const deleteMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<Milieu> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
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
