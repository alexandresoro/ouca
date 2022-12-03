import { type Logger } from "pino";
import { createPool, type DatabasePool } from "slonik";
import { createFieldNameTransformationInterceptor } from "slonik-interceptor-field-name-transformation";
import { buildSettingsRepository } from "../repositories/settings/settings-repository";
import { buildUserRepository } from "../repositories/user/user-repository";
import { createQueryLoggingInterceptor } from "../slonik/slonik-pino-interceptor";
import { createResultParserInterceptor } from "../slonik/slonik-zod-interceptor";
import { logger } from "../utils/logger";
import options from "../utils/options";
import { buildSettingsService, type SettingsService } from "./settings-service";
import { buildTokenService, type TokenService } from "./token-service";
import { buildUserService, type UserService } from "./user-service";

export type Services = {
  logger: Logger;
  slonik: DatabasePool;
  settingsService: SettingsService;
  tokenService: TokenService;
  userService: UserService;
};

export const buildServices = async (): Promise<Services> => {
  // Database connection
  const slonik = await createPool(options.database.url, {
    interceptors: [
      createFieldNameTransformationInterceptor({ format: "CAMEL_CASE" }),
      createResultParserInterceptor(),
      createQueryLoggingInterceptor(logger),
    ],
  });

  const settingsRepository = buildSettingsRepository({ slonik });
  const userRepository = buildUserRepository({ slonik });

  const userService = buildUserService({
    logger,
    slonik,
    userRepository,
    settingsRepository,
  });

  const settingsService = buildSettingsService({
    logger,
    settingsRepository,
  });

  const tokenService = buildTokenService({
    userService,
  });

  return {
    logger,
    slonik,
    settingsService,
    tokenService,
    userService,
  };
};
