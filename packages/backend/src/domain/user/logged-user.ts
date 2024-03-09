import type { UserRole } from "@domain/user/user-role.js";

export type LoggedUser = {
  id: string;
  role: UserRole;
};
