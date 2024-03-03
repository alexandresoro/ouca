import { dbConfig } from "@infrastructure/config/database-config.js";
import { oidcConfig } from "@infrastructure/config/oidc-config.js";
import { buildAgeRepository } from "@infrastructure/repositories/age/age-repository.js";
import { buildDepartmentRepository } from "@infrastructure/repositories/department/department-repository.js";
import { buildDistanceEstimateRepository } from "@infrastructure/repositories/distance-estimate/distance-estimate-repository.js";
import { buildNumberEstimateRepository } from "@infrastructure/repositories/number-estimate/number-estimate-repository.js";
import { buildObserverRepository } from "@infrastructure/repositories/observer/observer-repository.js";
import { buildSettingsRepository } from "@infrastructure/repositories/settings/settings-repository.js";
import { buildSexRepository } from "@infrastructure/repositories/sex/sex-repository.js";
import { buildSpeciesClassRepository } from "@infrastructure/repositories/species-class/species-class-repository.js";
import { buildUserRepository } from "@infrastructure/repositories/user/user-repository.js";
import { buildWeatherRepository } from "@infrastructure/repositories/weather/weather-repository.js";
import { type DatabasePool } from "slonik";
import { buildAgeService, type AgeService } from "../application/services/age/age-service.js";
import {
  buildDepartmentService,
  type DepartmentService,
} from "../application/services/department/department-service.js";
import {
  buildDistanceEstimateService,
  type DistanceEstimateService,
} from "../application/services/distance-estimate/distance-estimate-service.js";
import {
  buildNumberEstimateService,
  type NumberEstimateService,
} from "../application/services/number-estimate/number-estimate-service.js";
import { buildObserverService, type ObserverService } from "../application/services/observer/observer-service.js";
import { buildSettingsService, type SettingsService } from "../application/services/settings/settings-service.js";
import { buildSexService, type SexService } from "../application/services/sex/sex-service.js";
import { buildUserService, type UserService } from "../application/services/user/user-service.js";
import { buildWeatherService, type WeatherService } from "../application/services/weather/weather-service.js";
import { buildCommuneRepository } from "../repositories/commune/commune-repository.js";
import { buildComportementRepository } from "../repositories/comportement/comportement-repository.js";
import { buildDonneeComportementRepository } from "../repositories/donnee-comportement/donnee-comportement-repository.js";
import { buildDonneeMilieuRepository } from "../repositories/donnee-milieu/donnee-milieu-repository.js";
import { buildDonneeRepository } from "../repositories/donnee/donnee-repository.js";
import { buildEspeceRepository } from "../repositories/espece/espece-repository.js";
import { buildInventaireAssocieRepository } from "../repositories/inventaire-associe/inventaire-associe-repository.js";
import { buildInventaireMeteoRepository } from "../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import { buildInventaireRepository } from "../repositories/inventaire/inventaire-repository.js";
import { buildLieuditRepository } from "../repositories/lieudit/lieudit-repository.js";
import { buildMilieuRepository } from "../repositories/milieu/milieu-repository.js";
import getSlonikInstance from "../slonik/slonik-instance.js";
import { logger } from "../utils/logger.js";
import { buildBehaviorService, type BehaviorService } from "./entities/behavior/behavior-service.js";
import { buildDonneeService, type DonneeService } from "./entities/donnee-service.js";
import { buildEnvironmentService, type EnvironmentService } from "./entities/environment/environment-service.js";
import { buildInventaireService, type InventaireService } from "./entities/inventaire-service.js";
import { buildLocalityService, type LocalityService } from "./entities/locality/locality-service.js";
import { buildSpeciesClassService, type SpeciesClassService } from "./entities/species-class/species-class-service.js";
import { buildSpeciesService, type SpeciesService } from "./entities/species/species-service.js";
import { buildTownService, type TownService } from "./entities/town/town-service.js";
import { buildGeoJSONService, type GeoJSONService } from "./geojson-service.js";
import { buildOidcWithInternalUserMappingService } from "./oidc/oidc-with-internal-user-mapping.js";
import { buildZitadelOidcService, type ZitadelOidcService } from "./oidc/zitadel-oidc-service.js";

export type Services = {
  slonik: DatabasePool;
  ageService: AgeService;
  behaviorService: BehaviorService;
  classService: SpeciesClassService;
  departmentService: DepartmentService;
  distanceEstimateService: DistanceEstimateService;
  entryService: DonneeService;
  environmentService: EnvironmentService;
  inventoryService: InventaireService;
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
  const behaviorRepository = buildComportementRepository({ slonik });
  const classRepository = buildSpeciesClassRepository();
  const departmentRepository = buildDepartmentRepository();
  const distanceEstimateRepository = buildDistanceEstimateRepository();
  const entryRepository = buildDonneeRepository({ slonik });
  const entryBehaviorRepository = buildDonneeComportementRepository({ slonik });
  const entryEnvironmentRepository = buildDonneeMilieuRepository({ slonik });
  const environmentRepository = buildMilieuRepository({ slonik });
  const inventoryRepository = buildInventaireRepository({ slonik });
  const inventoryAssociateRepository = buildInventaireAssocieRepository({ slonik });
  const inventoryWeatherRepository = buildInventaireMeteoRepository({ slonik });
  const localityRepository = buildLieuditRepository({ slonik });
  const numberEstimateRepository = buildNumberEstimateRepository();
  const observerRepository = buildObserverRepository();
  const settingsRepository = buildSettingsRepository();
  const sexRepository = buildSexRepository();
  const speciesRepository = buildEspeceRepository({ slonik });
  const townRepository = buildCommuneRepository({ slonik });
  const userRepository = buildUserRepository({ settingsRepository });
  const weatherRepository = buildWeatherRepository();

  const ageService = buildAgeService({
    ageRepository,
    entryRepository,
  });

  const classService = buildSpeciesClassService({
    classRepository,
    speciesRepository,
    entryRepository,
  });

  const townService = buildTownService({
    townRepository,
    localityRepository,
    entryRepository,
  });

  const behaviorService = buildBehaviorService({
    behaviorRepository,
    entryRepository,
  });

  const departmentService = buildDepartmentService({
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

  const speciesService = buildSpeciesService({
    classService,
    speciesRepository,
    entryRepository,
  });

  const distanceEstimateService = buildDistanceEstimateService({
    distanceEstimateRepository,
    entryRepository,
  });

  const numberEstimateService = buildNumberEstimateService({
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

  const localityService = buildLocalityService({
    localityRepository,
    inventoryRepository,
    entryRepository,
  });

  const weatherService = buildWeatherService({
    weatherRepository,
    entryRepository,
  });

  const environmentService = buildEnvironmentService({
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
