export const databaseRoles = ["admin", "contributor"] as const;
export type DatabaseRole = (typeof databaseRoles)[number];

export type User = {
  id: string;
  username: string;
  password?: never;
  role: DatabaseRole;
  firstName: string;
  lastName: string | null;
};

export type UserWithPassword = Omit<User, "password"> & {
  password: string;
};

export type LoggedUser = Pick<User, "id" | "role">;
