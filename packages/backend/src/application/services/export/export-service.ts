import type { LoggedUser } from "@domain/user/logged-user.js";
import type { ExportRepository } from "@interfaces/export-repository-interface.js";
import type { Behavior } from "@ou-ca/common/api/entities/behavior";
import type { Environment } from "@ou-ca/common/api/entities/environment";
import type { EntriesSearchParams } from "@ou-ca/common/api/entry";
import { GPS_COORDINATES } from "@ou-ca/common/coordinates-system/gps.object";
import { getNicheurStatusToDisplay } from "@ou-ca/common/helpers/nicheur-helper";
import type { AgeService } from "../age/age-service.js";
import type { BehaviorService } from "../behavior/behavior-service.js";
import type { DepartmentService } from "../department/department-service.js";
import type { DistanceEstimateService } from "../distance-estimate/distance-estimate-service.js";
import type { EntryService } from "../entry/entry-service.js";
import type { EnvironmentService } from "../environment/environment-service.js";
import type { InventoryService } from "../inventory/inventory-service.js";
import type { LocalityService } from "../locality/locality-service.js";
import type { NumberEstimateService } from "../number-estimate/number-estimate-service.js";
import type { ObserverService } from "../observer/observer-service.js";
import type { SexService } from "../sex/sex-service.js";
import type { SpeciesClassService } from "../species-class/species-class-service.js";
import type { SpeciesService } from "../species/species-service.js";
import type { TownService } from "../town/town-service.js";
import type { WeatherService } from "../weather/weather-service.js";

const SEPARATOR_COMMA = ", ";

type ExportServiceDependencies = {
  exportRepository: ExportRepository;
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
};

export const buildExportService = (dependencies: ExportServiceDependencies) => {
  const {
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
  } = dependencies;

  const generateAgesExport = async (): Promise<string> => {
    const agesDb = await ageService.findAllAges();

    const agesToExport = agesDb.map((ageDb) => {
      return {
        Âge: ageDb.libelle,
      };
    });

    const id = await exportRepository.storeExport(agesToExport, "Âges");
    return id;
  };

  const generateClassesExport = async (): Promise<string> => {
    const classes = await classService.findAllSpeciesClasses();

    const objectsToExport = classes.map((object) => {
      return { Classe: object.libelle };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Classes");
    return id;
  };

  const generateTownsExport = async (): Promise<string> => {
    const communesDb = await townService.findAllTownsWithDepartments();

    const objectsToExport = communesDb.map((communeDb) => {
      return {
        Département: communeDb.departmentCode,
        Code: communeDb.code,
        Nom: communeDb.nom,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Communes");
    return id;
  };

  const generateBehaviorsExport = async (): Promise<string> => {
    const comportementsDb = await behaviorService.findAllBehaviors();

    const comportementsToExport = comportementsDb.map((object) => {
      return {
        Code: object.code,
        Libellé: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(comportementsToExport, "Comportements");
    return id;
  };

  const generateDepartmentsExport = async (): Promise<string> => {
    const departementsDb = await departmentService.findAllDepartments();

    const objectsToExport = departementsDb.map((object) => {
      return {
        Département: object.code,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Départements");
    return id;
  };

  const generateEntriesExport = async (
    loggedUser: LoggedUser | null,
    searchCriteria: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> &
      Partial<{ pageNumber: number; pageSize: number }>,
  ): Promise<string> => {
    const coordinatesSystem = GPS_COORDINATES;
    const coordinatesSuffix = ` en ${coordinatesSystem.unitName} (${coordinatesSystem.name})`;

    const donnees = (await entryService.findPaginatedEntries(loggedUser, searchCriteria ?? {}))._unsafeUnwrap();

    const objectsToExport = await Promise.all(
      donnees.map(async (donnee) => {
        const inventaire = (await inventoryService.findInventoryOfEntryId(donnee.id, loggedUser))._unsafeUnwrap();

        if (!inventaire) {
          return Promise.reject("Should not happen");
        }

        const observateur = (
          await observerService.findObserver(Number.parseInt(inventaire.observerId), loggedUser)
        )._unsafeUnwrap();
        const lieudit = (await localityService.findLocalityOfInventoryId(inventaire.id, loggedUser))._unsafeUnwrap();
        const commune = (await townService.findTownOfLocalityId(lieudit?.id, loggedUser))._unsafeUnwrap();
        const departement = (await departmentService.findDepartmentOfTownId(commune?.id, loggedUser))._unsafeUnwrap();
        const associes = (await observerService.findObservers(inventaire.associateIds, loggedUser))._unsafeUnwrap();
        const meteos = (await weatherService.findWeathers(inventaire.weatherIds, loggedUser))._unsafeUnwrap();
        const espece = (
          await speciesService.findSpecies(Number.parseInt(donnee.speciesId), loggedUser)
        )._unsafeUnwrap();
        const classe = (await classService.findSpeciesClassOfSpecies(espece?.id, loggedUser))._unsafeUnwrap();
        const age = (await ageService.findAge(Number.parseInt(donnee.ageId), loggedUser))._unsafeUnwrap();
        const sexe = (await sexService.findSex(Number.parseInt(donnee.sexId), loggedUser))._unsafeUnwrap();
        const estimationDistance =
          donnee.distanceEstimateId != null
            ? (
                await distanceEstimateService.findDistanceEstimate(
                  Number.parseInt(donnee.distanceEstimateId),
                  loggedUser,
                )
              )._unsafeUnwrap()
            : null;
        const estimationNombre = (
          await numberEstimateService.findNumberEstimate(Number.parseInt(donnee.numberEstimateId), loggedUser)
        )._unsafeUnwrap();
        const comportements = (await behaviorService.findBehaviors(donnee.behaviorIds, loggedUser))._unsafeUnwrap();
        const milieux = (await environmentService.findEnvironments(donnee.environmentIds, loggedUser))._unsafeUnwrap();

        const nicheurStatus = getNicheurStatusToDisplay(comportements, "");

        return {
          ID: donnee.id,
          Observateur: observateur?.libelle,
          "Observateurs associés": associes.length
            ? associes.map((associe) => associe.libelle).join(SEPARATOR_COMMA)
            : "",
          Date: inventaire?.date ? new Date(inventaire.date) : "", // TODO test this
          Heure: inventaire?.time,
          Durée: inventaire?.duration,
          Département: departement?.code,
          "Code commune": commune?.code,
          "Nom commune": commune?.nom,
          "Lieu-dit": lieudit?.nom,
          [`Latitude${coordinatesSuffix}`]:
            inventaire?.customizedCoordinates?.latitude ?? lieudit?.coordinates.latitude,
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
          "Nombre d'individus": donnee.number,
          "Estimation du nombre": estimationNombre?.libelle,
          "Estimation de la distance": estimationDistance?.libelle,
          "Distance en mètres": donnee.distance,
          "Numéro de regroupement": donnee.grouping,
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
          Commentaires: donnee.comment,
        };
      }),
    );

    const id = await exportRepository.storeExport(objectsToExport, "Données");
    return id;
  };

  const generateSpeciesExport = async (): Promise<string> => {
    const especes = await speciesService.findAllSpeciesWithClasses();

    const objectsToExport = especes.map((espece) => {
      return {
        Classe: espece.classLabel,
        Code: espece.code,
        "Nom français": espece.nomFrancais,
        "Nom scientifique": espece.nomLatin,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Espèces");
    return id;
  };

  const generateDistanceEstimatesExport = async (): Promise<string> => {
    const estimations = await distanceEstimateService.findAllDistanceEstimates();

    const objectsToExport = estimations.map((object) => {
      return {
        "Estimation de la distance": object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Estimations de la distance");
    return id;
  };

  const generateNumberEstimatesExport = async (): Promise<string> => {
    const estimations = await numberEstimateService.findAllNumberEstimates();

    const objectsToExport = estimations.map((object) => {
      return {
        "Estimation du nombre": object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Estimations du nombre");
    return id;
  };

  const generateLocalitiesExport = async (): Promise<string> => {
    const lieuxDits = await localityService.findAllLocalitiesWithTownAndDepartment();

    const objectsToExport = lieuxDits.map((lieudit) => {
      return {
        Département: lieudit.departmentCode,
        "Code commune": lieudit.townCode,
        "Nom commune": lieudit.townName,
        "Lieu-dit": lieudit.nom,
        Latitude: lieudit.latitude,
        Longitude: lieudit.longitude,
        Altitude: lieudit.altitude,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Lieux-dits");
    return id;
  };

  const generateWeathersExport = async (): Promise<string> => {
    const meteos = await weatherService.findAllWeathers();

    const objectsToExport = meteos.map((object) => {
      return {
        Météo: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Météos");
    return id;
  };

  const generateEnvironmentsExport = async (): Promise<string> => {
    const milieuxDb = await environmentService.findAllEnvironments();

    const milieuxToExport = milieuxDb.map((object) => {
      return {
        Code: object.code,
        Libellé: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(milieuxToExport, "Milieux");
    return id;
  };

  const generateObserversExport = async (): Promise<string> => {
    const observateurs = await observerService.findAllObservers();

    const objectsToExport = observateurs.map((object) => {
      return {
        Observateur: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Observateurs");
    return id;
  };

  const generateSexesExport = async (): Promise<string> => {
    const sexes = await sexService.findAllSexes();

    const objectsToExport = sexes.map((object) => {
      return {
        Sexe: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Sexes");
    return id;
  };

  const getExport = async (exportId: string): Promise<Buffer | null> => {
    return exportRepository.getExport(exportId);
  };

  return {
    generateAgesExport,
    generateClassesExport,
    generateTownsExport,
    generateBehaviorsExport,
    generateDepartmentsExport,
    generateEntriesExport,
    generateSpeciesExport,
    generateDistanceEstimatesExport,
    generateNumberEstimatesExport,
    generateLocalitiesExport,
    generateWeathersExport,
    generateEnvironmentsExport,
    generateObserversExport,
    generateSexesExport,
    getExport,
  };
};

export type ExportService = ReturnType<typeof buildExportService>;

const getComportement = (comportements: Behavior[], index: number): string => {
  return comportements.length >= index ? `${comportements[index - 1].code} - ${comportements[index - 1].libelle}` : "";
};

const getMilieu = (milieux: Environment[], index: number): string => {
  return milieux.length >= index ? `${milieux[index - 1].code} - ${milieux[index - 1].libelle}` : "";
};
