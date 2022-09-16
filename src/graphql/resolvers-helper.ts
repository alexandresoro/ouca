import { isEntityEditable } from "../services/entities/entities-utils";
import { LoggedUserInfo } from "../services/token-service";

export const isEntityEditableResolver = <T extends { id?: number } | null>(
  findEntityById: (id: number, user: LoggedUserInfo | null) => Promise<{ ownerId?: string | null } | null>
): ((parent: T, args: unknown, { user }: { user: LoggedUserInfo | null }) => Promise<boolean>) => {
  return async (parent: T, args: unknown, { user }: { user: LoggedUserInfo | null }): Promise<boolean> => {
    if (!parent?.id) {
      return false;
    }
    const entity = await findEntityById(parent.id, user);
    return isEntityEditable(entity, user);
  };
};

export const entityNbDonneesResolver = <T extends { id?: number } | null>(
  getDonneesCountByEntity: (id: number, user: LoggedUserInfo | null) => Promise<number | null>
): ((parent: T, args: unknown, { user }: { user: LoggedUserInfo | null }) => Promise<number | null>) => {
  return async (parent: T, args: unknown, { user }: { user: LoggedUserInfo | null }): Promise<number | null> => {
    if (!parent?.id) {
      return null;
    }
    return getDonneesCountByEntity(parent.id, user);
  };
};
