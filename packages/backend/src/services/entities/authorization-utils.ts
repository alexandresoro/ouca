import { type LoggedUser } from "../../types/User.js";
import { OucaError } from "../../utils/errors.js";

export function validateAuthorization(loggedUser: LoggedUser | null | undefined): asserts loggedUser is LoggedUser {
  if (!loggedUser) {
    throw new OucaError("OUCA0001");
  }
}
