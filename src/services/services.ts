import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import { buildSettingsRepository } from "../repositories/settings/settings-repository";
import { buildUserRepository } from "../repositories/user/user-repository";
import { buildTokenService, type TokenService } from "./token-service";
import { buildUserService, type UserService } from "./user-service";

type Dependencies = {
  logger: Logger;
  slonik: DatabasePool;
};

export type Services = {
  tokenService: TokenService;
  userService: UserService;
};

export const buildServices = ({ logger, slonik }: Dependencies): Services => {
  const settingsRepository = buildSettingsRepository({ slonik });
  const userRepository = buildUserRepository({ slonik });

  const userService = buildUserService({
    logger,
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
