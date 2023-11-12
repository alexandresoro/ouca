import { dbConfig } from "@infrastructure/config/database-config.js";
import { oidcConfig } from "@infrastructure/config/oidc-config.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { buildSettingsRepository as buildSettingsRepositoryKysely } from "@infrastructure/repositories/settings/settings-repository.js";
import { buildUserRepository } from "@infrastructure/repositories/user/user-repository.js";
import { type Redis } from "ioredis";
import { type DatabasePool } from "slonik";
import { buildSettingsService, type SettingsService } from "../application/services/settings/settings-service.js";
import { buildUserService, type UserService } from "../application/services/user/user-service.js";
import { buildAgeRepository } from "../repositories/age/age-repository.js";
import { buildClasseRepository } from "../repositories/classe/classe-repository.js";
import { buildCommuneRepository } from "../repositories/commune/commune-repository.js";
import { buildComportementRepository } from "../repositories/comportement/comportement-repository.js";
import { buildDepartementRepository } from "../repositories/departement/departement-repository.js";
import { buildDonneeComportementRepository } from "../repositories/donnee-comportement/donnee-comportement-repository.js";
import { buildDonneeMilieuRepository } from "../repositories/donnee-milieu/donnee-milieu-repository.js";
import { buildDonneeRepository } from "../repositories/donnee/donnee-repository.js";
import { buildEspeceRepository } from "../repositories/espece/espece-repository.js";
import { buildEstimationDistanceRepository } from "../repositories/estimation-distance/estimation-distance-repository.js";
import { buildEstimationNombreRepository } from "../repositories/estimation-nombre/estimation-nombre-repository.js";
import { buildInventaireAssocieRepository } from "../repositories/inventaire-associe/inventaire-associe-repository.js";
import { buildInventaireMeteoRepository } from "../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import { buildInventaireRepository } from "../repositories/inventaire/inventaire-repository.js";
import { buildLieuditRepository } from "../repositories/lieudit/lieudit-repository.js";
import { buildMeteoRepository } from "../repositories/meteo/meteo-repository.js";
import { buildMilieuRepository } from "../repositories/milieu/milieu-repository.js";
import { buildObservateurRepository } from "../repositories/observateur/observateur-repository.js";
import { buildSexeRepository } from "../repositories/sexe/sexe-repository.js";
import getSlonikInstance from "../slonik/slonik-instance.js";
import { logger } from "../utils/logger.js";
import { buildAgeService, type AgeService } from "./entities/age-service.js";
import { buildClasseService, type ClasseService } from "./entities/classe-service.js";
import { buildCommuneService, type CommuneService } from "./entities/commune-service.js";
import { buildComportementService, type ComportementService } from "./entities/comportement-service.js";
import { buildDepartementService, type DepartementService } from "./entities/departement-service.js";
import { buildDonneeService, type DonneeService } from "./entities/donnee-service.js";
import { buildEspeceService, type EspeceService } from "./entities/espece-service.js";
import {
  buildEstimationDistanceService,
  type EstimationDistanceService,
} from "./entities/estimation-distance-service.js";
import { buildEstimationNombreService, type EstimationNombreService } from "./entities/estimation-nombre-service.js";
import { buildInventaireService, type InventaireService } from "./entities/inventaire-service.js";
import { buildLieuditService, type LieuditService } from "./entities/lieu-dit-service.js";
import { buildMeteoService, type MeteoService } from "./entities/meteo-service.js";
import { buildMilieuService, type MilieuService } from "./entities/milieu-service.js";
import { buildObservateurService, type ObservateurService } from "./entities/observateur-service.js";
import { buildSexeService, type SexeService } from "./entities/sexe-service.js";
import { buildGeoJSONService, type GeoJSONService } from "./geojson-service.js";
import { buildOidcWithInternalUserMappingService } from "./oidc/oidc-with-internal-user-mapping.js";
import { buildZitadelOidcService, type ZitadelOidcService } from "./oidc/zitadel-oidc-service.js";

export type Services = {
  slonik: DatabasePool;
  redis: Redis;
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
  userService: UserService;
  geojsonService: GeoJSONService;
  zitadelOidcService: ZitadelOidcService;
};

export const buildServices = async (): Promise<Services> => {
  // Database connection
  const slonik = await getSlonikInstance({ dbConfig, logger: logger.child({ module: "slonik" }) });

  logger.debug("Connection to database successful");

  const ageRepository = buildAgeRepository({ slonik });
  const classeRepository = buildClasseRepository({ slonik });
  const communeRepository = buildCommuneRepository({ slonik });
  const comportementRepository = buildComportementRepository({ slonik });
  const departementRepository = buildDepartementRepository({ slonik });
  const donneeRepository = buildDonneeRepository({ slonik });
  const donneeComportementRepository = buildDonneeComportementRepository({ slonik });
  const donneeMilieuRepository = buildDonneeMilieuRepository({ slonik });
  const especeRepository = buildEspeceRepository({ slonik });
  const estimationDistanceRepository = buildEstimationDistanceRepository({ slonik });
  const estimationNombreRepository = buildEstimationNombreRepository({ slonik });
  const inventaireRepository = buildInventaireRepository({ slonik });
  const inventaireAssocieRepository = buildInventaireAssocieRepository({ slonik });
  const inventaireMeteoRepository = buildInventaireMeteoRepository({ slonik });
  const lieuditRepository = buildLieuditRepository({ slonik });
  const meteoRepository = buildMeteoRepository({ slonik });
  const milieuRepository = buildMilieuRepository({ slonik });
  const observateurRepository = buildObservateurRepository({ slonik });
  const settingsRepository = buildSettingsRepositoryKysely();
  const sexeRepository = buildSexeRepository({ slonik });
  const userRepository = buildUserRepository({ settingsRepository });

  const ageService = buildAgeService({
    logger,
    ageRepository,
    donneeRepository,
  });

  const classeService = buildClasseService({
    logger,
    classeRepository,
    especeRepository,
    donneeRepository,
  });

  const communeService = buildCommuneService({
    logger,
    communeRepository,
    lieuditRepository,
    donneeRepository,
  });

  const comportementService = buildComportementService({
    logger,
    comportementRepository,
    donneeRepository,
  });

  const departementService = buildDepartementService({
    logger,
    departementRepository,
    communeRepository,
    lieuditRepository,
    donneeRepository,
  });

  const donneeService = buildDonneeService({
    logger,
    slonik,
    inventaireRepository,
    donneeRepository,
    donneeComportementRepository,
    donneeMilieuRepository,
  });

  const especeService = buildEspeceService({
    logger,
    classeService,
    especeRepository,
    donneeRepository,
  });

  const estimationDistanceService = buildEstimationDistanceService({
    logger,
    estimationDistanceRepository,
    donneeRepository,
  });

  const estimationNombreService = buildEstimationNombreService({
    logger,
    estimationNombreRepository,
    donneeRepository,
  });

  const inventaireService = buildInventaireService({
    logger,
    slonik,
    inventaireRepository,
    inventaireAssocieRepository,
    inventaireMeteoRepository,
    donneeRepository,
    lieuditRepository,
  });

  const lieuditService = buildLieuditService({
    logger,
    lieuditRepository,
    inventaireRepository,
    donneeRepository,
  });

  const meteoService = buildMeteoService({
    logger,
    meteoRepository,
    donneeRepository,
  });

  const milieuService = buildMilieuService({
    logger,
    milieuRepository,
    donneeRepository,
  });

  const observateurService = buildObservateurService({
    logger,
    observateurRepository,
    inventaireRepository,
    donneeRepository,
  });

  const sexeService = buildSexeService({
    logger,
    sexeRepository,
    donneeRepository,
  });

  const userService = buildUserService({
    userRepository,
  });

  const settingsService = buildSettingsService({
    logger,
    settingsRepository,
    departementService,
    observateurService,
    sexeService,
    ageService,
    estimationNombreService,
  });

  const geojsonService = buildGeoJSONService({
    logger,
    redis,
    lieuditRepository,
  });

  const oidcWithInternalUserMappingService = buildOidcWithInternalUserMappingService({ userService });
  const zitadelOidcService = buildZitadelOidcService({
    oidcConfig,
    oidcWithInternalUserMappingService,
  });

  logger.debug("Services initialized successfully");

  return {
    slonik,
    redis,
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
    userService,
    geojsonService,
    zitadelOidcService,
  };
};
