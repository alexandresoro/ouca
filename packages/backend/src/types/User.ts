export const userRoles = ["admin", "contributor"] as const;
export type UserRole = typeof userRoles[number];

export type User = {
  id: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string | null;
};

export type UserWithPassword = Omit<User, "password"> & {
  password: string;
};

export type LoggedUser = Pick<User, "id" | "role">;
