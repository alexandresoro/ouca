import type { Permissions } from "./permissions.js";
import type { UserRole } from "./user-role.js";

export type LoggedUser = {
  id: string;
  /**
   * @deprecated rely on permissions instead
   */
  role?: UserRole;
  permissions: Permissions;
};
