import { type LoggedUser } from "@domain/user/logged-user.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { type EntriesSearchParams } from "@ou-ca/common/api/entry";
import { GPS_COORDINATES } from "@ou-ca/common/coordinates-system/gps.object";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Environment } from "@ou-ca/common/entities/environment";
import { getNicheurStatusToDisplay } from "@ou-ca/common/helpers/nicheur-helper";
import { type Redis } from "ioredis";
import { randomUUID } from "node:crypto";
import { type AgeService } from "../application/services/age/age-service.js";
import { SEPARATOR_COMMA } from "../utils/constants.js";
import { writeExcelToBuffer } from "../utils/export-excel-utils.js";
import { type ClasseService } from "./entities/classe-service.js";
import { type CommuneService } from "./entities/commune-service.js";
import { type ComportementService } from "./entities/comportement-service.js";
import { type DepartementService } from "./entities/departement-service.js";
import { type DonneeService } from "./entities/donnee-service.js";
import { type EspeceService } from "./entities/espece-service.js";
import { type EstimationDistanceService } from "./entities/estimation-distance-service.js";
import { type EstimationNombreService } from "./entities/estimation-nombre-service.js";
import { type InventaireService } from "./entities/inventaire-service.js";
import { type LieuditService } from "./entities/lieu-dit-service.js";
import { type MeteoService } from "./entities/meteo-service.js";
import { type MilieuService } from "./entities/milieu-service.js";
import { type ObservateurService } from "./entities/observateur-service.js";
import { type SexeService } from "./entities/sexe-service.js";

export const EXPORT_ENTITY_RESULT_PREFIX = "exportEntity";

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

export const generateClassesExport = async ({ classeService }: { classeService: ClasseService }): Promise<string> => {
  const classes = await classeService.findAllClasses();

  const objectsToExport = classes.map((object) => {
    return { Classe: object.libelle };
  });

  const id = await storeExportInCache(objectsToExport, "Classes", redis);
  return id;
};

export const generateCommunesExport = async ({
  communeService,
}: { communeService: CommuneService }): Promise<string> => {
  const communesDb = await communeService.findAllCommunesWithDepartements();

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
  comportementService,
}: { comportementService: ComportementService }): Promise<string> => {
  const comportementsDb = await comportementService.findAllComportements();

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
  departementService,
}: { departementService: DepartementService }): Promise<string> => {
  const departementsDb = await departementService.findAllDepartements();

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
  }: {
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
  },
  loggedUser: LoggedUser | null,
  searchCriteria: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> &
    Partial<{ pageNumber: number; pageSize: number }>
): Promise<string> => {
  const coordinatesSystem = GPS_COORDINATES;
  const coordinatesSuffix = ` en ${coordinatesSystem.unitName} (${coordinatesSystem.name})`;

  const donnees = await donneeService.findPaginatedDonnees(loggedUser, searchCriteria ?? {});

  const objectsToExport = await Promise.all(
    donnees.map(async (donnee) => {
      const inventaire = await inventaireService.findInventaireOfDonneeId(donnee.id, loggedUser);

      if (!inventaire) {
        return Promise.reject("Should not happen");
      }

      const observateur = await observateurService.findObservateurOfInventaireId(parseInt(inventaire.id), loggedUser);
      const lieudit = await lieuditService.findLieuDitOfInventaireId(parseInt(inventaire.id), loggedUser);
      const commune = await communeService.findCommuneOfLieuDitId(lieudit?.id, loggedUser);
      const departement = await departementService.findDepartementOfCommuneId(commune?.id, loggedUser);
      const associes = await observateurService.findAssociesOfInventaireId(parseInt(inventaire.id), loggedUser);
      const meteos = await meteoService.findMeteosOfInventaireId(parseInt(inventaire.id), loggedUser);
      const espece = await especeService.findEspeceOfDonneeId(donnee?.id, loggedUser);
      const classe = await classeService.findClasseOfEspeceId(espece?.id, loggedUser);
      const age = await ageService.findAgeOfDonneeId(donnee?.id, loggedUser);
      const sexe = await sexeService.findSexeOfDonneeId(donnee?.id, loggedUser);
      const estimationDistance = await estimationDistanceService.findEstimationDistanceOfDonneeId(
        donnee?.id,
        loggedUser
      );
      const estimationNombre = await estimationNombreService.findEstimationNombreOfDonneeId(donnee?.id, loggedUser);
      const comportements = await comportementService.findComportementsOfDonneeId(donnee?.id, loggedUser);
      const milieux = await milieuService.findMilieuxOfDonneeId(donnee.id, loggedUser);

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

export const generateEspecesExport = async ({ especeService }: { especeService: EspeceService }): Promise<string> => {
  const especes = await especeService.findAllEspecesWithClasses();

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
  estimationDistanceService,
}: { estimationDistanceService: EstimationDistanceService }): Promise<string> => {
  const estimations = await estimationDistanceService.findAllEstimationsDistance();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation de la distance": object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Estimations de la distance", redis);
  return id;
};

export const generateEstimationsNombreExport = async ({
  estimationNombreService,
}: { estimationNombreService: EstimationNombreService }): Promise<string> => {
  const estimations = await estimationNombreService.findAllEstimationsNombre();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation du nombre": object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Estimations du nombre", redis);
  return id;
};

export const generateLieuxDitsExport = async ({
  lieuditService,
}: { lieuditService: LieuditService }): Promise<string> => {
  const lieuxDits = await lieuditService.findAllLieuxDitsWithCommuneAndDepartement();

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

export const generateMeteosExport = async ({ meteoService }: { meteoService: MeteoService }): Promise<string> => {
  const meteos = await meteoService.findAllMeteos();

  const objectsToExport = meteos.map((object) => {
    return {
      Météo: object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Météos", redis);
  return id;
};

export const generateMilieuxExport = async ({ milieuService }: { milieuService: MilieuService }): Promise<string> => {
  const milieuxDb = await milieuService.findAllMilieux();

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
  observateurService,
}: { observateurService: ObservateurService }): Promise<string> => {
  const observateurs = await observateurService.findAllObservateurs();

  const objectsToExport = observateurs.map((object) => {
    return {
      Observateur: object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Observateurs", redis);
  return id;
};

export const generateSexesExport = async ({ sexeService }: { sexeService: SexeService }): Promise<string> => {
  const sexes = await sexeService.findAllSexes();

  const objectsToExport = sexes.map((object) => {
    return {
      Sexe: object.libelle,
    };
  });

  const id = await storeExportInCache(objectsToExport, "Sexes", redis);
  return id;
};
