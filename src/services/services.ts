import { type Logger } from "pino";
import { createPool, type DatabasePool } from "slonik";
import { createFieldNameTransformationInterceptor } from "slonik-interceptor-field-name-transformation";
import { buildAgeRepository } from "../repositories/age/age-repository";
import { buildClasseRepository } from "../repositories/classe/classe-repository";
import { buildCommuneRepository } from "../repositories/commune/commune-repository";
import { buildComportementRepository } from "../repositories/comportement/comportement-repository";
import { buildDepartementRepository } from "../repositories/departement/departement-repository";
import { buildDonneeRepository } from "../repositories/donnee/donnee-repository";
import { buildEspeceRepository } from "../repositories/espece/espece-repository";
import { buildEstimationDistanceRepository } from "../repositories/estimation-distance/estimation-distance-repository";
import { buildEstimationNombreRepository } from "../repositories/estimation-nombre/estimation-nombre-repository";
import { buildInventaireRepository } from "../repositories/inventaire/inventaire-repository";
import { buildLieuditRepository } from "../repositories/lieudit/lieudit-repository";
import { buildMeteoRepository } from "../repositories/meteo/meteo-repository";
import { buildMilieuRepository } from "../repositories/milieu/milieu-repository";
import { buildObservateurRepository } from "../repositories/observateur/observateur-repository";
import { buildSettingsRepository } from "../repositories/settings/settings-repository";
import { buildSexeRepository } from "../repositories/sexe/sexe-repository";
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

  const ageRepository = buildAgeRepository({ slonik });
  const classeRepository = buildClasseRepository({ slonik });
  const communeRepository = buildCommuneRepository({ slonik });
  const comportementRepository = buildComportementRepository({ slonik });
  const departementRepository = buildDepartementRepository({ slonik });
  const donneeRepository = buildDonneeRepository({ slonik });
  const especeRepository = buildEspeceRepository({ slonik });
  const estimationDistanceRepository = buildEstimationDistanceRepository({ slonik });
  const estimationNombreRepository = buildEstimationNombreRepository({ slonik });
  const inventaireRepository = buildInventaireRepository({ slonik });
  const lieuditRepository = buildLieuditRepository({ slonik });
  const meteoRepository = buildMeteoRepository({ slonik });
  const milieuRepository = buildMilieuRepository({ slonik });
  const observateurRepository = buildObservateurRepository({ slonik });
  const settingsRepository = buildSettingsRepository({ slonik });
  const sexeRepository = buildSexeRepository({ slonik });
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
