import { Prisma } from ".prisma/client";
import { type LoggedUser } from "../../types/User";

type PaginationOptions = Partial<{
  pageNumber: number | null;
  pageSize: number | null;
}>;

export const isEntityEditable = (entity: { ownerId?: string | null } | null, user: LoggedUser | null): boolean => {
  if (!entity || !user) {
    return false;
  }
  return user?.role === "admin" || entity?.ownerId === user?.id;
};

// Utility method to compute the Prisma pagination from the API pagination
// Page number is starting at index 0
/**
 * @deprecated
 */
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

// Utility method to compute the SQL pagination from the API pagination
// Page number is starting at index 0
export const getSqlPagination = (
  paginationOptions: PaginationOptions | null | undefined
): { offset: number | undefined; limit: number | undefined } => {
  return {
    offset:
      paginationOptions?.pageNumber != null && paginationOptions?.pageSize
        ? paginationOptions.pageNumber * paginationOptions.pageSize
        : undefined,
    limit: paginationOptions?.pageSize ?? undefined,
  };
};

/**
 * @deprecated
 */
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
