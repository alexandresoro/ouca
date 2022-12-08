import { type Logger } from "pino";
import { createPool, type DatabasePool } from "slonik";
import { createFieldNameTransformationInterceptor } from "slonik-interceptor-field-name-transformation";
import config from "../config";
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
import { buildAgeService, type AgeService } from "./entities/age-service";
import { buildClasseService, type ClasseService } from "./entities/classe-service";
import { buildCommuneService, type CommuneService } from "./entities/commune-service";
import { buildComportementService, type ComportementService } from "./entities/comportement-service";
import { buildDepartementService, type DepartementService } from "./entities/departement-service";
import { buildDonneeService, type DonneeService } from "./entities/donnee-service";
import { buildEspeceService, type EspeceService } from "./entities/espece-service";
import { buildEstimationDistanceService, type EstimationDistanceService } from "./entities/estimation-distance-service";
import { buildEstimationNombreService, type EstimationNombreService } from "./entities/estimation-nombre-service";
import { buildInventaireService, type InventaireService } from "./entities/inventaire-service";
import { buildLieuditService, type LieuditService } from "./entities/lieu-dit-service";
import { buildMeteoService, type MeteoService } from "./entities/meteo-service";
import { buildMilieuService, type MilieuService } from "./entities/milieu-service";
import { buildObservateurService, type ObservateurService } from "./entities/observateur-service";
import { buildSexeService, type SexeService } from "./entities/sexe-service";
import { buildSettingsService, type SettingsService } from "./settings-service";
import { buildTokenService, type TokenService } from "./token-service";
import { buildUserService, type UserService } from "./user-service";

export type Services = {
  logger: Logger;
  slonik: DatabasePool;
  ageService: AgeService;
  classeService: ClasseService;
  communeService: CommuneService;
  comportementService: ComportementService;
  departementService: DepartementService;
  donneeService: DonneeService;
  especeService: EspeceService;
  estimationDistanceService: EstimationDistanceService;
  estimationNombreService: EstimationNombreService;
  inventaireService: InventaireService;
  lieuditService: LieuditService;
  meteoService: MeteoService;
  milieuService: MilieuService;
  observateurService: ObservateurService;
  sexeService: SexeService;
  settingsService: SettingsService;
  tokenService: TokenService;
  userService: UserService;
};

export const buildServices = async (): Promise<Services> => {
  // Database connection
  const slonik = await createPool(config.database.url, {
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

  const ageService = buildAgeService({
    logger,
    ageRepository,
    donneeRepository,
  });

  const classeService = buildClasseService({
    logger,
    classeRepository,
  });

  const communeService = buildCommuneService({
    logger,
    communeRepository,
  });

  const comportementService = buildComportementService({
    logger,
    comportementRepository,
  });

  const departementService = buildDepartementService({
    logger,
    departementRepository,
  });

  const donneeService = buildDonneeService({
    logger,
    donneeRepository,
  });

  const especeService = buildEspeceService({
    logger,
    especeRepository,
  });

  const estimationDistanceService = buildEstimationDistanceService({
    logger,
    estimationDistanceRepository,
  });

  const estimationNombreService = buildEstimationNombreService({
    logger,
    estimationNombreRepository,
  });

  const inventaireService = buildInventaireService({
    logger,
    inventaireRepository,
  });

  const lieuditService = buildLieuditService({
    logger,
    lieuditRepository,
  });

  const meteoService = buildMeteoService({
    logger,
    meteoRepository,
  });

  const milieuService = buildMilieuService({
    logger,
    milieuRepository,
  });

  const observateurService = buildObservateurService({
    logger,
    observateurRepository,
  });

  const sexeService = buildSexeService({
    logger,
    sexeRepository,
    donneeRepository,
  });

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
    ageService,
    classeService,
    communeService,
    comportementService,
    departementService,
    donneeService,
    especeService,
    estimationDistanceService,
    estimationNombreService,
    inventaireService,
    lieuditService,
    meteoService,
    milieuService,
    observateurService,
    sexeService,
    settingsService,
    tokenService,
    userService,
  };
};
