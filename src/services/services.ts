import { type DatabasePool } from "slonik";
import { buildUserRepository } from "../repositories/user/user-repository";
import { buildUserService } from "./user-service";

type Dependencies = {
  slonik: DatabasePool;
};

export type Services = {
  userService: ReturnType<typeof buildUserService>;
};

export const buildServices = ({ slonik }: Dependencies): Services => {
  const userRepository = buildUserRepository({ slonik });

  const userService = buildUserService({
    userRepository,
  });

  return {
    userService,
  };
};
