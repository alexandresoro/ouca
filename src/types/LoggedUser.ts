import { type User } from "./User";

/**
 * @deprecated
 */
export type LoggedUser = Pick<User, "id" | "role">;
