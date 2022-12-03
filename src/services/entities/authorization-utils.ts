import { type LoggedUser } from "../../types/User";
import { OucaError } from "../../utils/errors";

export function validateAuthorization(loggedUser: LoggedUser | null | undefined): asserts loggedUser is LoggedUser {
  if (!loggedUser) {
    throw new OucaError("OUCA0001");
  }
}
