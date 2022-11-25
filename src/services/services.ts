import { type DatabasePool } from "slonik";
import { buildUserRepository } from "../repositories/user/user-repository";
import { buildTokenService, type TokenService } from "./token-service";
import { buildUserService, type UserService } from "./user-service";

type Dependencies = {
  slonik: DatabasePool;
};

export type Services = {
  tokenService: TokenService;
  userService: UserService;
};

export const buildServices = ({ slonik }: Dependencies): Services => {
  const userRepository = buildUserRepository({ slonik });

  const userService = buildUserService({
    userRepository,
  });

  const tokenService = buildTokenService({
    userService,
  });

  return {
    tokenService,
    userService,
  };
};
