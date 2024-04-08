import type { LoggedUser } from "@domain/user/logged-user.js";

/**
 * @deprecated use permissions instead
 */
export const canModifyEntity = (entity: { ownerId?: string | null } | null, user: LoggedUser | null): boolean => {
  if (!entity || !user) {
    return false;
  }
  return user?.role === "admin" || entity?.ownerId === user?.id;
};
