import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";

/**
 * @deprecated use operation/result pattern instead
 */
export function validateAuthorization(loggedUser: LoggedUser | null | undefined): asserts loggedUser is LoggedUser {
  if (!loggedUser) {
    throw new OucaError("OUCA0001");
  }
}
