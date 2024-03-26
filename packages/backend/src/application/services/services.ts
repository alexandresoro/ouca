import { type Queues, createQueues } from "@infrastructure/bullmq/queues.js";
import { buildAgeRepository } from "@infrastructure/repositories/age/age-repository.js";
import { buildBehaviorRepository } from "@infrastructure/repositories/behavior/behavior-repository.js";
import { buildDepartmentRepository } from "@infrastructure/repositories/department/department-repository.js";
import { buildDistanceEstimateRepository } from "@infrastructure/repositories/distance-estimate/distance-estimate-repository.js";
import { buildEntryRepository } from "@infrastructure/repositories/entry/entry-repository.js";
import { buildEnvironmentRepository } from "@infrastructure/repositories/environment/environment-repository.js";
import { buildExportRepository } from "@infrastructure/repositories/export/export-repository.js";
import { buildInventoryRepository } from "@infrastructure/repositories/inventory/inventory-repository.js";
import { buildGeoJSONRepository } from "@infrastructure/repositories/locality/locality-geojson-repository.js";
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
import { logger } from "../../utils/logger.js";
import { type AgeService, buildAgeService } from "./age/age-service.js";
import { type BehaviorService, buildBehaviorService } from "./behavior/behavior-service.js";
import { type DepartmentService, buildDepartmentService } from "./department/department-service.js";
import {
  type DistanceEstimateService,
  buildDistanceEstimateService,
} from "./distance-estimate/distance-estimate-service.js";
import { type EntryService, buildEntryService } from "./entry/entry-service.js";
import { type EnvironmentService, buildEnvironmentService } from "./environment/environment-service.js";
import { type ExportService, buildExportService } from "./export/export-service.js";
import { type ImportService, buildImportService } from "./import/import-service.js";
import { type InventoryService, buildInventoryService } from "./inventory/inventory-service.js";
import { type GeoJSONService, buildGeoJSONService } from "./locality/geojson-service.js";
import { type LocalityService, buildLocalityService } from "./locality/locality-service.js";
import { type NumberEstimateService, buildNumberEstimateService } from "./number-estimate/number-estimate-service.js";
import { type ObserverService, buildObserverService } from "./observer/observer-service.js";
import { type OidcService, buildOidcService } from "./oidc/oidc-service.js";
import { type SettingsService, buildSettingsService } from "./settings/settings-service.js";
import { type SexService, buildSexService } from "./sex/sex-service.js";
import { type SpeciesClassService, buildSpeciesClassService } from "./species-class/species-class-service.js";
import { type SpeciesService, buildSpeciesService } from "./species/species-service.js";
import { type TownService, buildTownService } from "./town/town-service.js";
import { type UserService, buildUserService } from "./user/user-service.js";
import { type WeatherService, buildWeatherService } from "./weather/weather-service.js";

export type Services = {
  queues: Queues;
  ageService: AgeService;
  behaviorService: BehaviorService;
  classService: SpeciesClassService;
  departmentService: DepartmentService;
  distanceEstimateService: DistanceEstimateService;
  entryService: EntryService;
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
  exportService: ExportService;
  importService: ImportService;
  oidcService: OidcService;
};

export const buildServices = (): Services => {
  const queues = createQueues();

  const ageRepository = buildAgeRepository();
  const behaviorRepository = buildBehaviorRepository();
  const classRepository = buildSpeciesClassRepository();
  const departmentRepository = buildDepartmentRepository();
  const distanceEstimateRepository = buildDistanceEstimateRepository();
  const entryRepository = buildEntryRepository();
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

  const localitiesGeoJSONRepository = buildGeoJSONRepository();

  const exportRepository = buildExportRepository();

  const ageService = buildAgeService({
    ageRepository,
  });

  const classService = buildSpeciesClassService({
    classRepository,
    speciesRepository,
  });

  const townService = buildTownService({
    townRepository,
    localityRepository,
  });

  const behaviorService = buildBehaviorService({
    behaviorRepository,
  });

  const departmentService = buildDepartmentService({
    departmentRepository,
    townRepository,
    localityRepository,
  });

  const entryService = buildEntryService({
    inventoryRepository,
    entryRepository,
  });

  const speciesService = buildSpeciesService({
    classService,
    speciesRepository,
  });

  const distanceEstimateService = buildDistanceEstimateService({
    distanceEstimateRepository,
  });

  const numberEstimateService = buildNumberEstimateService({
    numberEstimateRepository,
  });

  const inventoryService = buildInventoryService({
    inventoryRepository,
    entryRepository,
    localityRepository,
  });

  const localityService = buildLocalityService({
    localityRepository,
    inventoryRepository,
  });

  const weatherService = buildWeatherService({
    weatherRepository,
  });

  const environmentService = buildEnvironmentService({
    environmentRepository,
  });

  const observerService = buildObserverService({
    observerRepository,
  });

  const sexService = buildSexService({
    sexRepository,
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
    localitiesGeoJSONRepository,
  });

  const oidcService = buildOidcService({
    userService,
  });

  const exportService = buildExportService({
    exportRepository,
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
  });

  const importService = buildImportService({
    importQueue: queues.import,
  });

  logger.debug("Services initialized successfully");

  return {
    queues,
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
    oidcService,
    exportService,
    importService,
  };
};
