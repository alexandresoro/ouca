export const userRoles = ["admin", "contributor"] as const;
export type UserRole = typeof userRoles[number];
