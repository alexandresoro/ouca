import { Comportement, DatabaseRole, Nicheur, Prisma } from "@prisma/client";
import {
  FindParams,
  MutationUpsertComportementArgs,
  QueryPaginatedComportementsArgs,
} from "../../graphql/generated/graphql-types";
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

export const findComportement = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<(Comportement & ReadonlyStatus) | null> => {
  validateAuthorization(loggedUser);

  const comportementEntity = await prisma.comportement.findUnique({
    where: {
      id,
    },
  });

  if (!comportementEntity) {
    return null;
  }

  return {
    ...comportementEntity,
    readonly: isEntityReadOnly(comportementEntity, loggedUser),
  };
};

export const findComportementsByIds = async (
  ids: number[],
  loggedUser: LoggedUser | null = null
): Promise<Comportement[]> => {
  const comportementEntities = await prisma.comportement.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      id: {
        in: ids,
      },
    },
  });

  return comportementEntities?.map((comportement) => {
    return {
      ...comportement,
      readonly: isEntityReadOnly(comportement, loggedUser),
    };
  });
};

export const findComportements = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<Comportement[]> => {
  const { q, max } = params ?? {};

  const matchingCodesAsNumber = numberAsCodeSqlMatcher(q);
  const matchingCodesAsNumberClause = matchingCodesAsNumber.map((matchingCode) => {
    return {
      code: {
        startsWith: matchingCode,
      },
    };
  });

  const matchingWithCode = await prisma.comportement.findMany({
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

  const matchingWithLibelle = await prisma.comportement.findMany({
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

const getFilterClause = (q: string | null | undefined): Prisma.ComportementWhereInput => {
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
          {
            nicheur: {
              in: (Object.keys(Nicheur) as Nicheur[]).filter((nicheur) => nicheur.includes(q)),
            },
          },
        ],
      }
    : {};
};

export const findPaginatedComportements = async (
  options: Partial<QueryPaginatedComportementsArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<Comportement[]> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let orderBy: Prisma.Enumerable<Prisma.ComportementOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "code":
      case "libelle":
      case "nicheur":
        orderBy = {
          [orderByField]: sortOrder,
        };
        break;
      case "nbDonnees":
        orderBy = {
          donnee_comportement: {
            _count: sortOrder,
          },
        };
        break;
      default:
        orderBy = {};
    }
  }

  const comportements = await prisma.comportement.findMany({
    ...getPrismaPagination(searchParams),
    orderBy,
    where: getFilterClause(searchParams?.q),
  });

  const donneesByComportement = includeCounts
    ? await prisma.donnee_comportement.groupBy({
        by: ["comportement_id"],
        where: {
          comportement_id: {
            in: comportements?.map((comportement) => comportement.id),
          },
        },
        _count: true,
      })
    : null;

  return comportements.map((comportement) => {
    return {
      ...comportement,
      readonly: isEntityReadOnly(comportement, loggedUser),
      ...(includeCounts
        ? {
            nbDonnees:
              donneesByComportement?.find(
                (donneeByComportement) => donneeByComportement.comportement_id === comportement.id
              )?._count ?? 0,
          }
        : {}),
    };
  });
};

export const getComportementsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.comportement.count({
    where: getFilterClause(q),
  });
};

export const upsertComportement = async (
  args: MutationUpsertComportementArgs,
  loggedUser: LoggedUser
): Promise<Comportement & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedComportement: Comportement;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.comportement.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing comportement
    try {
      upsertedComportement = await prisma.comportement.update({
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
    // Create a new comportement
    try {
      upsertedComportement = await prisma.comportement.create({ data: { ...data, ownerId: loggedUser.id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return {
    ...upsertedComportement,
    readonly: false,
  };
};

export const deleteComportement = async (id: number, loggedUser: LoggedUser | null): Promise<Comportement> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.comportement.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }

  return prisma.comportement.delete({
    where: {
      id,
    },
  });
};

export const createComportements = async (
  comportements: Omit<Prisma.ComportementCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.comportement.createMany({
    data: comportements.map((comportement) => {
      return { ...comportement, ownerId: loggedUser.id };
    }),
  });
};
