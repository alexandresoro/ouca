import type { Permissions } from "./permissions.js";
import type { UserRole } from "./user-role.js";

export type LoggedUser = {
  id: string;
  role: UserRole;
  permissions: Permissions;
};
