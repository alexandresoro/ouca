export const userRoles = ["admin", "contributor", "user"] as const;
export type UserRole = (typeof userRoles)[number];
