import { type LoggedUser } from "@domain/user/logged-user.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { type Behavior } from "@ou-ca/common/api/entities/behavior";
import { type Environment } from "@ou-ca/common/api/entities/environment";
import { type EntriesSearchParams } from "@ou-ca/common/api/entry";
import { GPS_COORDINATES } from "@ou-ca/common/coordinates-system/gps.object";
import { getNicheurStatusToDisplay } from "@ou-ca/common/helpers/nicheur-helper";
import { type Redis } from "ioredis";
import { randomUUID } from "node:crypto";
import { type AgeService } from "../application/services/age/age-service.js";
import { type DepartmentService } from "../application/services/department/department-service.js";
import { type DistanceEstimateService } from "../application/services/distance-estimate/distance-estimate-service.js";
import { type NumberEstimateService } from "../application/services/number-estimate/number-estimate-service.js";
import { type ObserverService } from "../application/services/observer/observer-service.js";
import { type SexService } from "../application/services/sex/sex-service.js";
import { type SpeciesClassService } from "../application/services/species-class/species-class-service.js";
import { type WeatherService } from "../application/services/weather/weather-service.js";
import { writeExcelToBuffer } from "../utils/export-excel-utils.js";
import { type BehaviorService } from "./entities/behavior/behavior-service.js";
import { type DonneeService } from "./entities/donnee-service.js";
import { type EnvironmentService } from "./entities/environment/environment-service.js";
import { type InventaireService } from "./entities/inventaire-service.js";
import { type LocalityService } from "./entities/locality/locality-service.js";
import { type SpeciesService } from "./entities/species/species-service.js";
import { type TownService } from "./entities/town/town-service.js";

export const EXPORT_ENTITY_RESULT_PREFIX = "exportEntity";

const SEPARATOR_COMMA = ", ";

const storeExportInCache = async (
  entitiesToExport: Record<string, unknown>[],
  sheetName: string,
  redis: Redis
): Promise<string> => {
  const id = randomUUID();

  const redisKey = `${EXPORT_ENTITY_RESULT_PREFIX}:${id}`;
  const exportArrayBuffer = await writeExcelToBuffer(entitiesToExport, sheetName);
  const exportBuffer = Buffer.from(exportArrayBuffer);

  await redis.set(redisKey, exportBuffer, "EX", 600);

  return id;
};

export const generateAgesExport = async ({ ageService }: { ageService: AgeService }): Promise<string> => {
  const agesDb = await ageService.findAllAges();

  const agesToExport = agesDb.map((ageDb) => {
    return {
      Âge: ageDb.libelle,
    };
  });

  const id = await storeExportInCache(agesToExport, "Âges", redis);
  return id;
};

export const generateClassesExport = async ({
  classService,
}: { classService: SpeciesClassService }): Promise<string> => {
  const classes = await classService.findAllSpeciesClasses();

  const objectsToExport = classes.map((object) => {
    return { Classe: object.libelle };
  });

  const id = await storeExportInCache(objectsToExport, "Classes", redis);
  return id;
};

export const generateCommunesExport = async ({ townService }: { townService: TownService }): Promise<string> => {
  const communesDb = await townService.findAllTownsWithDepartments();

  const objectsToExport = communesDb.map((communeDb) => {
    return {
      Département: communeDb.departementCode,
      Code: communeDb.code,
      Nom: communeDb.nom,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Communes", redis);
  return id;
};

export const generateComportementsExport = async ({
  behaviorService,
}: { behaviorService: BehaviorService }): Promise<string> => {
  const comportementsDb = await behaviorService.findAllBehaviors();

  const comportementsToExport = comportementsDb.map((object) => {
    return {
      Code: object.code,
      Libellé: object.libelle,
    };
  });

  const id = await storeExportInCache(comportementsToExport, "Comportements", redis);
  return id;
};

export const generateDepartementsExport = async ({
  departmentService,
}: { departmentService: DepartmentService }): Promise<string> => {
  const departementsDb = await departmentService.findAllDepartments();

  const objectsToExport = departementsDb.map((object) => {
    return {
      Département: object.code,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Départements", redis);
  return id;
};

const getComportement = (comportements: Behavior[], index: number): string => {
  return comportements.length >= index ? `${comportements[index - 1].code} - ${comportements[index - 1].libelle}` : "";
};

const getMilieu = (milieux: Environment[], index: number): string => {
  return milieux.length >= index ? `${milieux[index - 1].code} - ${milieux[index - 1].libelle}` : "";
};

export const generateDonneesExport = async (
  {
    ageService,
    classService,
    townService,
    behaviorService,
    departmentService,
    entryService,
    speciesService,
    distanceEstimateService,
    numberEstimateService,
    inventoryService,
    localityService,
    weatherService,
    environmentService,
    observerService,
    sexService,
  }: {
    ageService: AgeService;
    classService: SpeciesClassService;
    townService: TownService;
    behaviorService: BehaviorService;
    departmentService: DepartmentService;
    entryService: DonneeService;
    speciesService: SpeciesService;
    distanceEstimateService: DistanceEstimateService;
    numberEstimateService: NumberEstimateService;
    inventoryService: InventaireService;
    localityService: LocalityService;
    weatherService: WeatherService;
    environmentService: EnvironmentService;
    observerService: ObserverService;
    sexService: SexService;
  },
  loggedUser: LoggedUser | null,
  searchCriteria: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> &
    Partial<{ pageNumber: number; pageSize: number }>
): Promise<string> => {
  const coordinatesSystem = GPS_COORDINATES;
  const coordinatesSuffix = ` en ${coordinatesSystem.unitName} (${coordinatesSystem.name})`;

  const donnees = await entryService.findPaginatedDonnees(loggedUser, searchCriteria ?? {});

  const objectsToExport = await Promise.all(
    donnees.map(async (donnee) => {
      const inventaire = await inventoryService.findInventaireOfDonneeId(donnee.id, loggedUser);

      if (!inventaire) {
        return Promise.reject("Should not happen");
      }

      const observateur = (
        await observerService.findObserverOfInventoryId(parseInt(inventaire.id), loggedUser)
      )._unsafeUnwrap();
      const lieudit = await localityService.findLocalityOfInventoryId(parseInt(inventaire.id), loggedUser);
      const commune = await townService.findTownOfLocalityId(lieudit?.id, loggedUser);
      const departement = (await departmentService.findDepartmentOfTownId(commune?.id, loggedUser))._unsafeUnwrap();
      const associes = (
        await observerService.findAssociatesOfInventoryId(parseInt(inventaire.id), loggedUser)
      )._unsafeUnwrap();
      const meteos = (
        await weatherService.findWeathersOfInventoryId(parseInt(inventaire.id), loggedUser)
      )._unsafeUnwrap();
      const espece = await speciesService.findSpeciesOfEntryId(donnee?.id, loggedUser);
      const classe = (await classService.findSpeciesClassOfSpecies(espece?.id, loggedUser))._unsafeUnwrap();
      const age = (await ageService.findAgeOfEntryId(donnee?.id, loggedUser))._unsafeUnwrap();
      const sexe = (await sexService.findSexOfEntryId(donnee?.id, loggedUser))._unsafeUnwrap();
      const estimationDistance = (
        await distanceEstimateService.findDistanceEstimateOfEntryId(donnee?.id, loggedUser)
      )._unsafeUnwrap();
      const estimationNombre = (
        await numberEstimateService.findNumberEstimateOfEntryId(donnee?.id, loggedUser)
      )._unsafeUnwrap();
      const comportements = await behaviorService.findBehaviorsOfEntryId(donnee?.id, loggedUser);
      const milieux = await environmentService.findEnvironmentsOfEntryId(donnee.id, loggedUser);

      const nicheurStatus = getNicheurStatusToDisplay(comportements, "");

      return {
        ID: donnee.id,
        Observateur: observateur?.libelle,
        "Observateurs associés": associes.length
          ? associes.map((associe) => associe.libelle).join(SEPARATOR_COMMA)
          : "",
        Date: inventaire?.date ? new Date(inventaire.date) : "", // TODO test this
        Heure: inventaire?.heure,
        Durée: inventaire?.duree,
        Département: departement?.code,
        "Code commune": commune?.code,
        "Nom commune": commune?.nom,
        "Lieu-dit": lieudit?.nom,
        [`Latitude${coordinatesSuffix}`]: inventaire?.customizedCoordinates?.latitude ?? lieudit?.coordinates.latitude,
        [`Longitude${coordinatesSuffix}`]:
          inventaire?.customizedCoordinates?.longitude ?? lieudit?.coordinates.longitude,
        "Altitude en mètres": inventaire?.customizedCoordinates?.altitude ?? lieudit?.coordinates.altitude,
        "Température en °C": inventaire?.temperature,
        Météo: meteos.length ? meteos.map((meteo) => meteo.libelle).join(SEPARATOR_COMMA) : "",
        Classe: classe?.libelle,
        "Code espèce": espece?.code,
        "Nom francais": espece?.nomFrancais,
        "Nom scientifique": espece?.nomLatin,
        Sexe: sexe?.libelle,
        Âge: age?.libelle,
        "Nombre d'individus": donnee.nombre,
        "Estimation du nombre": estimationNombre?.libelle,
        "Estimation de la distance": estimationDistance?.libelle,
        "Distance en mètres": donnee.distance,
        "Numéro de regroupement": donnee.regroupement,
        Nicheur: nicheurStatus,
        "Comportement 1": getComportement(comportements, 1),
        "Comportement 2": getComportement(comportements, 2),
        "Comportement 3": getComportement(comportements, 3),
        "Comportement 4": getComportement(comportements, 4),
        "Comportement 5": getComportement(comportements, 5),
        "Comportement 6": getComportement(comportements, 6),
        "Milieu 1": getMilieu(milieux, 1),
        "Milieu 2": getMilieu(milieux, 2),
        "Milieu 3": getMilieu(milieux, 3),
        "Milieu 4": getMilieu(milieux, 4),
        Commentaires: donnee.commentaire,
      };
    })
  );

  const id = await storeExportInCache(objectsToExport, "Données", redis);
  return id;
};

export const generateEspecesExport = async ({
  speciesService,
}: { speciesService: SpeciesService }): Promise<string> => {
  const especes = await speciesService.findAllSpeciesWithClasses();

  const objectsToExport = especes.map((espece) => {
    return {
      Classe: espece.classeLibelle,
      Code: espece.code,
      "Nom français": espece.nomFrancais,
      "Nom scientifique": espece.nomLatin,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Espèces", redis);
  return id;
};

export const generateEstimationsDistanceExport = async ({
  distanceEstimateService,
}: { distanceEstimateService: DistanceEstimateService }): Promise<string> => {
  const estimations = await distanceEstimateService.findAllDistanceEstimates();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation de la distance": object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Estimations de la distance", redis);
  return id;
};

export const generateEstimationsNombreExport = async ({
  numberEstimateService,
}: { numberEstimateService: NumberEstimateService }): Promise<string> => {
  const estimations = await numberEstimateService.findAllNumberEstimates();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation du nombre": object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Estimations du nombre", redis);
  return id;
};

export const generateLieuxDitsExport = async ({
  localityService,
}: { localityService: LocalityService }): Promise<string> => {
  const lieuxDits = await localityService.findAllLocalitiesWithTownAndDepartment();

  const objectsToExport = lieuxDits.map((lieudit) => {
    return {
      Département: lieudit.departementCode,
      "Code commune": lieudit.communeCode,
      "Nom commune": lieudit.communeNom,
      "Lieu-dit": lieudit.nom,
      Latitude: lieudit.latitude,
      Longitude: lieudit.longitude,
      Altitude: lieudit.altitude,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Lieux-dits", redis);
  return id;
};

export const generateMeteosExport = async ({ weatherService }: { weatherService: WeatherService }): Promise<string> => {
  const meteos = await weatherService.findAllWeathers();

  const objectsToExport = meteos.map((object) => {
    return {
      Météo: object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Météos", redis);
  return id;
};

export const generateMilieuxExport = async ({
  environmentService,
}: { environmentService: EnvironmentService }): Promise<string> => {
  const milieuxDb = await environmentService.findAllEnvironments();

  const milieuxToExport = milieuxDb.map((object) => {
    return {
      Code: object.code,
      Libellé: object.libelle,
    };
  });

  const id = await storeExportInCache(milieuxToExport, "Milieux", redis);
  return id;
};

export const generateObservateursExport = async ({
  observerService,
}: { observerService: ObserverService }): Promise<string> => {
  const observateurs = await observerService.findAllObservers();

  const objectsToExport = observateurs.map((object) => {
    return {
      Observateur: object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Observateurs", redis);
  return id;
};

export const generateSexesExport = async ({ sexService }: { sexService: SexService }): Promise<string> => {
  const sexes = await sexService.findAllSexes();

  const objectsToExport = sexes.map((object) => {
    return {
      Sexe: object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Sexes", redis);
  return id;
};
