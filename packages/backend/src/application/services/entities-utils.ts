import { canModifyEntity } from "@domain/entity-access/entity-access.js";
import type { LoggedUser } from "@domain/user/logged-user.js";

type PaginationOptions = Partial<{
  pageNumber: number | null;
  pageSize: number | null;
}>;

/**
 * @deprecated use permissions instead as it's more reliable
 */
export function enrichEntityWithEditableStatus<E>(entity: E, user: LoggedUser | null): E & { editable: boolean };
export function enrichEntityWithEditableStatus(entity: null, user: LoggedUser | null): null;
export function enrichEntityWithEditableStatus<E>(
  entity: E | null,
  user: LoggedUser | null,
): (E & { editable: boolean }) | null {
  if (!entity) {
    return null;
  }

  return {
    ...entity,
    editable: canModifyEntity(entity, user),
  };
}

// Utility method to compute the SQL pagination from the API pagination
// Page number is starting at index 1
export const getSqlPagination = (
  paginationOptions: PaginationOptions | null | undefined,
): { offset: number | undefined; limit: number | undefined } => {
  return {
    offset:
      paginationOptions?.pageNumber != null && paginationOptions?.pageSize
        ? (paginationOptions.pageNumber - 1) * paginationOptions.pageSize
        : undefined,
    limit: paginationOptions?.pageSize ?? undefined,
  };
};
