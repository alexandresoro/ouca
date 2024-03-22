import { dbConfig } from "@infrastructure/config/database-config.js";
import { oidcConfig } from "@infrastructure/config/oidc-config.js";
import { buildAgeRepository } from "@infrastructure/repositories/age/age-repository.js";
import { buildBehaviorRepository } from "@infrastructure/repositories/behavior/behavior-repository.js";
import { buildDepartmentRepository } from "@infrastructure/repositories/department/department-repository.js";
import { buildDistanceEstimateRepository } from "@infrastructure/repositories/distance-estimate/distance-estimate-repository.js";
import { buildEntryRepository } from "@infrastructure/repositories/entry/entry-repository.js";
import { buildEnvironmentRepository } from "@infrastructure/repositories/environment/environment-repository.js";
import { buildInventoryRepository } from "@infrastructure/repositories/inventory/inventory-repository.js";
import { buildLocalityRepository } from "@infrastructure/repositories/locality/locality-repository.js";
import { buildNumberEstimateRepository } from "@infrastructure/repositories/number-estimate/number-estimate-repository.js";
import { buildObserverRepository } from "@infrastructure/repositories/observer/observer-repository.js";
import { buildSettingsRepository } from "@infrastructure/repositories/settings/settings-repository.js";
import { buildSexRepository } from "@infrastructure/repositories/sex/sex-repository.js";
import { buildSpeciesClassRepository } from "@infrastructure/repositories/species-class/species-class-repository.js";
import { buildSpeciesRepository } from "@infrastructure/repositories/species/species-repository.js";
import { buildTownRepository } from "@infrastructure/repositories/town/town-repository.js";
import { buildUserRepository } from "@infrastructure/repositories/user/user-repository.js";
import { buildWeatherRepository } from "@infrastructure/repositories/weather/weather-repository.js";
import type { DatabasePool } from "slonik";
import { type AgeService, buildAgeService } from "../application/services/age/age-service.js";
import { type BehaviorService, buildBehaviorService } from "../application/services/behavior/behavior-service.js";
import {
  type DepartmentService,
  buildDepartmentService,
} from "../application/services/department/department-service.js";
import {
  type DistanceEstimateService,
  buildDistanceEstimateService,
} from "../application/services/distance-estimate/distance-estimate-service.js";
import {
  type EnvironmentService,
  buildEnvironmentService,
} from "../application/services/environment/environment-service.js";
import { type InventoryService, buildInventoryService } from "../application/services/inventory/inventory-service.js";
import { type LocalityService, buildLocalityService } from "../application/services/locality/locality-service.js";
import {
  type NumberEstimateService,
  buildNumberEstimateService,
} from "../application/services/number-estimate/number-estimate-service.js";
import { type ObserverService, buildObserverService } from "../application/services/observer/observer-service.js";
import { type SettingsService, buildSettingsService } from "../application/services/settings/settings-service.js";
import { type SexService, buildSexService } from "../application/services/sex/sex-service.js";
import {
  type SpeciesClassService,
  buildSpeciesClassService,
} from "../application/services/species-class/species-class-service.js";
import { type SpeciesService, buildSpeciesService } from "../application/services/species/species-service.js";
import { type TownService, buildTownService } from "../application/services/town/town-service.js";
import { type UserService, buildUserService } from "../application/services/user/user-service.js";
import { type WeatherService, buildWeatherService } from "../application/services/weather/weather-service.js";
import { buildDonneeComportementRepository } from "../repositories/donnee-comportement/donnee-comportement-repository.js";
import { buildDonneeMilieuRepository } from "../repositories/donnee-milieu/donnee-milieu-repository.js";
import { buildDonneeRepository } from "../repositories/donnee/donnee-repository.js";
import getSlonikInstance from "../slonik/slonik-instance.js";
import { logger } from "../utils/logger.js";
import { type DonneeService, buildDonneeService } from "./entities/donnee-service.js";
import { type GeoJSONService, buildGeoJSONService } from "./geojson-service.js";
import { buildOidcWithInternalUserMappingService } from "./oidc/oidc-with-internal-user-mapping.js";
import { type ZitadelOidcService, buildZitadelOidcService } from "./oidc/zitadel-oidc-service.js";

export type Services = {
  slonik: DatabasePool;
  ageService: AgeService;
  behaviorService: BehaviorService;
  classService: SpeciesClassService;
  departmentService: DepartmentService;
  distanceEstimateService: DistanceEstimateService;
  entryService: DonneeService;
  environmentService: EnvironmentService;
  inventoryService: InventoryService;
  localityService: LocalityService;
  numberEstimateService: NumberEstimateService;
  observerService: ObserverService;
  sexService: SexService;
  speciesService: SpeciesService;
  townService: TownService;
  weatherService: WeatherService;
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
  const behaviorRepository = buildBehaviorRepository();
  const classRepository = buildSpeciesClassRepository();
  const departmentRepository = buildDepartmentRepository();
  const distanceEstimateRepository = buildDistanceEstimateRepository();
  const entryRepository = buildEntryRepository();
  const entryRepositoryLegacy = buildDonneeRepository({ slonik });
  const entryBehaviorRepository = buildDonneeComportementRepository({ slonik });
  const entryEnvironmentRepository = buildDonneeMilieuRepository({ slonik });
  const environmentRepository = buildEnvironmentRepository();
  const inventoryRepository = buildInventoryRepository();
  const localityRepository = buildLocalityRepository();
  const numberEstimateRepository = buildNumberEstimateRepository();
  const observerRepository = buildObserverRepository();
  const settingsRepository = buildSettingsRepository();
  const sexRepository = buildSexRepository();
  const speciesRepository = buildSpeciesRepository();
  const townRepository = buildTownRepository();
  const userRepository = buildUserRepository({ settingsRepository });
  const weatherRepository = buildWeatherRepository();

  const ageService = buildAgeService({
    ageRepository,
  });

  const classService = buildSpeciesClassService({
    classRepository,
    speciesRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const townService = buildTownService({
    townRepository,
    localityRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const behaviorService = buildBehaviorService({
    behaviorRepository,
  });

  const departmentService = buildDepartmentService({
    departmentRepository,
    townRepository,
    localityRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const entryService = buildDonneeService({
    slonik,
    inventoryRepository,
    entryRepository: entryRepositoryLegacy,
    entryBehaviorRepository,
    entryEnvironmentRepository,
  });

  const speciesService = buildSpeciesService({
    classService,
    speciesRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const distanceEstimateService = buildDistanceEstimateService({
    distanceEstimateRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const numberEstimateService = buildNumberEstimateService({
    numberEstimateRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const inventoryService = buildInventoryService({
    inventoryRepository,
    entryRepository: entryRepositoryLegacy,
    localityRepository,
  });

  const localityService = buildLocalityService({
    localityRepository,
    inventoryRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const weatherService = buildWeatherService({
    weatherRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const environmentService = buildEnvironmentService({
    environmentRepository,
    entryRepository: entryRepositoryLegacy,
  });

  const observerService = buildObserverService({
    observerRepository,
  });

  const sexService = buildSexService({
    sexRepository,
    entryRepository: entryRepositoryLegacy,
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
