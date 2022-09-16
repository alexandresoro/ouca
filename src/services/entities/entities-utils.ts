import { DatabaseRole, Prisma } from ".prisma/client";
import { ConditionalPick } from "type-fest";
import { SortOrder } from "../../graphql/generated/graphql-types";
import { LoggedUser } from "../../types/LoggedUser";

type SortOptions = Partial<{
  orderBy: string | null;
  sortOrder: SortOrder | null;
}>;

type PaginationOptions = Partial<{
  pageNumber: number | null;
  pageSize: number | null;
}>;

/**
 * @deprecated
 */
export const isEntityReadOnly = (entity: { ownerId?: string | null }, user: LoggedUser | null): boolean => {
  return !(user?.role === DatabaseRole.admin || entity?.ownerId === user?.id);
};

export const isEntityEditable = (entity: { ownerId?: string | null } | null, user: LoggedUser | null): boolean => {
  if (!entity || !user) {
    return false;
  }
  return user?.role === DatabaseRole.admin || entity?.ownerId === user?.id;
};

// Utility method to compute the Prisma pagination from the API pagination
// Page number is starting at index 0
export const getPrismaPagination = (
  paginationOptions: PaginationOptions | null | undefined
): { skip: number; take: number } | Record<string, never> => {
  if (paginationOptions?.pageNumber == null || !paginationOptions?.pageSize) {
    return {};
  }

  return {
    skip: paginationOptions.pageNumber * paginationOptions.pageSize,
    take: paginationOptions.pageSize,
  };
};

export const getEntiteAvecLibelleFilterClause = (
  q: string | null | undefined
): Partial<{ libelle: Prisma.StringFilter }> => {
  return q != null && q.length
    ? {
        libelle: {
          contains: q,
        },
      }
    : {};
};

export const getSqlPagination = (paginationOptions: PaginationOptions | null | undefined): Prisma.Sql => {
  if (!paginationOptions) {
    return Prisma.empty;
  }

  const { pageNumber, pageSize } = paginationOptions;
  return pageNumber != null && pageSize ? Prisma.sql`LIMIT ${pageSize} OFFSET ${pageNumber * pageSize}` : Prisma.empty;
};

export const getSqlSorting = (sortOptions: SortOptions): Prisma.Sql => {
  const { orderBy, sortOrder } = sortOptions;
  return orderBy ? Prisma.raw(`ORDER BY ${orderBy} ${sortOrder ?? "asc"}`) : Prisma.empty;
};

export const queryParametersToFindAllEntities = (
  attributeForOrdering?: string,
  order?: Prisma.SortOrder
): { orderBy?: Record<string, Prisma.SortOrder> } => {
  if (attributeForOrdering) {
    return {
      orderBy: {
        [attributeForOrdering]: order ?? Prisma.SortOrder.asc,
      },
    };
  }
  return {};
};

export const transformQueryRawBigIntsToNumbers = <
  T extends Record<string, unknown>,
  U extends ConditionalPick<T, bigint>
>(
  result: T
): Omit<T, keyof U> & Record<keyof U, number> => {
  return Object.entries(result).reduce((obj, [key, value]) => {
    obj[key] = typeof value === "bigint" ? Number(value) : value;
    return obj;
  }, {} as Record<string, unknown>) as Omit<T, keyof U> & Record<keyof U, number>;
};

export const transformQueryRawResultsBigIntsToNumbers = <T extends Record<string, unknown>>(results: T[]) => {
  return results.map(transformQueryRawBigIntsToNumbers);
};
