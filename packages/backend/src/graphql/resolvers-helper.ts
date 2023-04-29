import { isEntityEditable } from "../services/entities/entities-utils.js";
import { type LoggedUser } from "../types/User.js";

export const isEntityEditableResolver = <T extends { id?: number } | null>(
  findEntityById: (id: number, user: LoggedUser | null) => Promise<{ ownerId?: string | null } | null>
): ((parent: T, args: unknown, { user }: { user: LoggedUser | null }) => Promise<boolean>) => {
  return async (parent: T, args: unknown, { user }: { user: LoggedUser | null }): Promise<boolean> => {
    if (!parent?.id) {
      return false;
    }
    const entity = await findEntityById(parent.id, user);
    return isEntityEditable(entity, user);
  };
};

export const entityNbDonneesResolver = <T extends { id?: number } | null>(
  getDonneesCountByEntity: (id: number, user: LoggedUser | null) => Promise<number | null>
): ((parent: T, args: unknown, { user }: { user: LoggedUser | null }) => Promise<number | null>) => {
  return async (parent: T, args: unknown, { user }: { user: LoggedUser | null }): Promise<number | null> => {
    if (!parent?.id) {
      return null;
    }
    return getDonneesCountByEntity(parent.id, user);
  };
};
