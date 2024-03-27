import type { LoggedUser } from "@domain/user/logged-user.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const loggedUserFactory = Factory.define<LoggedUser>(() => {
  return {
    id: faker.string.uuid(),
    role: "user",
  };
});
