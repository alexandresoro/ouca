export const userRoles = ["admin", "contributor"] as const;
export type UserRole = typeof userRoles[number];

export type LoggedUser = {
  id: string;
  role: UserRole;
};
