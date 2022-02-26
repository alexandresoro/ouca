import { DatabaseRole, Prisma } from ".prisma/client";
import { SortOrder } from "../../model/graphql";
import { LoggedUser } from "../../types/LoggedUser";

type SortOptions = Partial<{
  orderBy: string | null;
  sortOrder: SortOrder | null;
}>;

type PaginationOptions = Partial<{
  pageNumber: number | null;
  pageSize: number | null;
}>;

export type ReadonlyStatus = {
  readonly: boolean;
};

export const isEntityReadOnly = (entity: { ownerId: string }, user: LoggedUser | null): boolean => {
  return !(user?.role === DatabaseRole.admin || entity.ownerId === user?.id);
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
    take: paginationOptions.pageSize
  };
};

export const getEntiteAvecLibelleFilterClause = (
  q: string | null | undefined
): Partial<{ libelle: Prisma.StringFilter }> => {
  return q != null && q.length
    ? {
        libelle: {
          contains: q
        }
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
        [attributeForOrdering]: order ?? Prisma.SortOrder.asc
      }
    };
  }
  return {};
};
