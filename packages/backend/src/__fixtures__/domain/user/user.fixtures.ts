import type { CreateUserInput, User } from "@domain/user/user.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const userFactory = Factory.define<User>(() => {
  return {
    id: faker.string.uuid(),
    extProviderId: faker.string.sample(),
    extProviderName: faker.string.alpha(),
    settings: {},
  };
});

export const createUserInputFactory = Factory.define<CreateUserInput>(() => {
  return {
    extProvider: faker.string.alpha(),
    extProviderUserId: faker.string.sample(),
  };
});
