import { LoggedUser } from "../../types/LoggedUser";
import { OucaError } from "../../utils/errors";

export const validateAuthorization = (loggedUser: LoggedUser | null | undefined): void => {
  if (!loggedUser) {
    throw new OucaError("OUCA0001");
  }
};
