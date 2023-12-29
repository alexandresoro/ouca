import { dbConfig } from "@infrastructure/config/database-config.js";
import { oidcConfig } from "@infrastructure/config/oidc-config.js";
import { buildObserverRepository } from "@infrastructure/repositories/observer/observer-repository.js";
import { buildSettingsRepository } from "@infrastructure/repositories/settings/settings-repository.js";
import { buildSexRepository } from "@infrastructure/repositories/sex/sex-repository.js";
import { buildUserRepository } from "@infrastructure/repositories/user/user-repository.js";
import { type DatabasePool } from "slonik";
import { buildAgeService, type AgeService } from "../application/services/age/age-service.js";
import { buildObserverService, type ObserverService } from "../application/services/observer/observer-service.js";
import { buildSettingsService, type SettingsService } from "../application/services/settings/settings-service.js";
import { buildSexService, type SexService } from "../application/services/sex/sex-service.js";
import { buildUserService, type UserService } from "../application/services/user/user-service.js";
import { buildAgeRepository } from "../infrastructure/repositories/age/age-repository.js";
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
import getSlonikInstance from "../slonik/slonik-instance.js";
import { logger } from "../utils/logger.js";
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
import { buildGeoJSONService, type GeoJSONService } from "./geojson-service.js";
import { buildOidcWithInternalUserMappingService } from "./oidc/oidc-with-internal-user-mapping.js";
import { buildZitadelOidcService, type ZitadelOidcService } from "./oidc/zitadel-oidc-service.js";

export type Services = {
  slonik: DatabasePool;
  ageService: AgeService;
  behaviorService: ComportementService;
  classService: ClasseService;
  departmentService: DepartementService;
  distanceEstimateService: EstimationDistanceService;
  entryService: DonneeService;
  environmentService: MilieuService;
  inventoryService: InventaireService;
  localityService: LieuditService;
  numberEstimateService: EstimationNombreService;
  observerService: ObserverService;
  sexService: SexService;
  speciesService: EspeceService;
  townService: CommuneService;
  weatherService: MeteoService;
  settingsService: SettingsService;
  userService: UserService;
  geojsonService: GeoJSONService;
  zitadelOidcService: ZitadelOidcService;
};

export const buildServices = async (): Promise<Services> => {
  // Database connection
  const slonik = await getSlonikInstance({ dbConfig, logger: logger.child({ module: "slonik" }) });

  logger.debug("Connection to database successful");

  const ageRepository = buildAgeRepository();
  const behaviorRepository = buildComportementRepository({ slonik });
  const classRepository = buildClasseRepository({ slonik });
  const departmentRepository = buildDepartementRepository({ slonik });
  const distanceEstimateRepository = buildEstimationDistanceRepository({ slonik });
  const entryRepository = buildDonneeRepository({ slonik });
  const entryBehaviorRepository = buildDonneeComportementRepository({ slonik });
  const entryEnvironmentRepository = buildDonneeMilieuRepository({ slonik });
  const environmentRepository = buildMilieuRepository({ slonik });
  const inventoryRepository = buildInventaireRepository({ slonik });
  const inventoryAssociateRepository = buildInventaireAssocieRepository({ slonik });
  const inventoryWeatherRepository = buildInventaireMeteoRepository({ slonik });
  const localityRepository = buildLieuditRepository({ slonik });
  const numberEstimateRepository = buildEstimationNombreRepository({ slonik });
  const observerRepository = buildObserverRepository();
  const settingsRepository = buildSettingsRepository();
  const sexRepository = buildSexRepository();
  const speciesRepository = buildEspeceRepository({ slonik });
  const townRepository = buildCommuneRepository({ slonik });
  const userRepository = buildUserRepository({ settingsRepository });
  const weatherRepository = buildMeteoRepository({ slonik });

  const ageService = buildAgeService({
    ageRepository,
    entryRepository,
  });

  const classService = buildClasseService({
    classRepository,
    speciesRepository,
    entryRepository,
  });

  const townService = buildCommuneService({
    townRepository,
    localityRepository,
    entryRepository,
  });

  const behaviorService = buildComportementService({
    behaviorRepository,
    entryRepository,
  });

  const departmentService = buildDepartementService({
    departmentRepository,
    townRepository,
    localityRepository,
    entryRepository,
  });

  const entryService = buildDonneeService({
    slonik,
    inventoryRepository,
    entryRepository,
    entryBehaviorRepository,
    entryEnvironmentRepository,
  });

  const speciesService = buildEspeceService({
    classService,
    speciesRepository,
    entryRepository,
  });

  const distanceEstimateService = buildEstimationDistanceService({
    distanceEstimateRepository,
    entryRepository,
  });

  const numberEstimateService = buildEstimationNombreService({
    numberEstimateRepository,
    entryRepository,
  });

  const inventoryService = buildInventaireService({
    slonik,
    inventoryRepository,
    inventoryAssociateRepository,
    inventoryWeatherRepository,
    entryRepository,
    localityRepository,
  });

  const localityService = buildLieuditService({
    localityRepository,
    inventoryRepository,
    entryRepository,
  });

  const weatherService = buildMeteoService({
    weatherRepository,
    entryRepository,
  });

  const environmentService = buildMilieuService({
    environmentRepository,
    entryRepository,
  });

  const observerService = buildObserverService({
    observerRepository,
  });

  const sexService = buildSexService({
    sexRepository,
    entryRepository,
  });

  const userService = buildUserService({
    userRepository,
  });

  const settingsService = buildSettingsService({
    settingsRepository,
    departmentService,
    observerService,
    sexService,
    ageService,
    numberEstimateService,
  });

  const geojsonService = buildGeoJSONService({
    localityRepository,
  });

  const oidcWithInternalUserMappingService = buildOidcWithInternalUserMappingService({ userService });
  const zitadelOidcService = buildZitadelOidcService({
    oidcConfig,
    oidcWithInternalUserMappingService,
  });

  logger.debug("Services initialized successfully");

  return {
    slonik,
    ageService,
    behaviorService,
    classService,
    departmentService,
    distanceEstimateService,
    entryService,
    environmentService,
    inventoryService,
    localityService,
    numberEstimateService,
    observerService,
    sexService,
    speciesService,
    townService,
    weatherService,
    settingsService,
    userService,
    geojsonService,
    zitadelOidcService,
  };
};
