import { GPS_COORDINATES } from "@ou-ca/common/coordinates-system/gps.object";
import { getNicheurStatusToDisplay } from "@ou-ca/common/helpers/nicheur-helper";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { type SearchDonneeCriteria } from "../graphql/generated/graphql-types.js";
import { type Comportement } from "../repositories/comportement/comportement-repository-types.js";
import { type Milieu } from "../repositories/milieu/milieu-repository-types.js";
import { type LoggedUser } from "../types/User.js";
import { SEPARATOR_COMMA } from "../utils/constants.js";
import { writeToExcelFile } from "../utils/export-excel-utils.js";
import { PUBLIC_DIR_PATH } from "../utils/paths.js";
import { type AgeService } from "./entities/age-service.js";
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

export const generateAgesExport = async (ageService: AgeService): Promise<string> => {
  const agesDb = await ageService.findAllAges();

  const agesToExport = agesDb.map((ageDb) => {
    return {
      Âge: ageDb.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(agesToExport, "Âges", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateClassesExport = async (classeService: ClasseService): Promise<string> => {
  const classes = await classeService.findAllClasses();

  const objectsToExport = classes.map((object) => {
    return { Classe: object.libelle };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Classes", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateCommunesExport = async (communeService: CommuneService): Promise<string> => {
  const communesDb = await communeService.findAllCommunesWithDepartements();

  const objectsToExport = communesDb.map((communeDb) => {
    return {
      Département: communeDb.departementCode,
      Code: communeDb.code,
      Nom: communeDb.nom,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Communes", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateComportementsExport = async (comportementService: ComportementService): Promise<string> => {
  const comportementsDb = await comportementService.findAllComportements();

  const comportementsToExport = comportementsDb.map((object) => {
    return {
      Code: object.code,
      Libellé: object.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(comportementsToExport, "Comportements", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateDepartementsExport = async (departementService: DepartementService): Promise<string> => {
  const departementsDb = await departementService.findAllDepartements();

  const objectsToExport = departementsDb.map((object) => {
    return {
      Département: object.code,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Départements", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

const getComportement = (comportements: Comportement[], index: number): string => {
  return comportements.length >= index ? comportements[index - 1].code + " - " + comportements[index - 1].libelle : "";
};

const getMilieu = (milieux: Milieu[], index: number): string => {
  return milieux.length >= index ? milieux[index - 1].code + " - " + milieux[index - 1].libelle : "";
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
  searchCriteria: SearchDonneeCriteria | null | undefined
): Promise<string> => {
  const coordinatesSystem = GPS_COORDINATES;
  const coordinatesSuffix = " en " + coordinatesSystem.unitName + " (" + coordinatesSystem.name + ")";

  const donnees = await donneeService.findPaginatedDonnees(loggedUser, { searchCriteria });

  const objectsToExport = await Promise.all(
    donnees.map(async (donnee) => {
      const inventaire = await inventaireService.findInventaireOfDonneeId(donnee.id, loggedUser);
      const observateur = await observateurService.findObservateurOfInventaireId(inventaire?.id, loggedUser);
      const lieudit = await lieuditService.findLieuDitOfInventaireId(inventaire?.id, loggedUser);
      const commune = await communeService.findCommuneOfLieuDitId(lieudit?.id, loggedUser);
      const departement = await departementService.findDepartementOfCommuneId(commune?.id, loggedUser);
      const associes = await observateurService.findAssociesOfInventaireId(inventaire?.id, loggedUser);
      const meteos = await meteoService.findMeteosOfInventaireId(inventaire?.id, loggedUser);
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
        ["Latitude" + coordinatesSuffix]: inventaire?.customizedCoordinates?.latitude ?? lieudit?.latitude,
        ["Longitude" + coordinatesSuffix]: inventaire?.customizedCoordinates?.longitude ?? lieudit?.longitude,
        "Altitude en mètres": inventaire?.customizedCoordinates?.altitude ?? lieudit?.altitude,
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

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "donnees", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateEspecesExport = async (especeService: EspeceService): Promise<string> => {
  const especes = await especeService.findAllEspecesWithClasses();

  const objectsToExport = especes.map((espece) => {
    return {
      Classe: espece.classeLibelle,
      Code: espece.code,
      "Nom français": espece.nomFrancais,
      "Nom scientifique": espece.nomLatin,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Espèces", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateEstimationsDistanceExport = async (
  estimationDistanceService: EstimationDistanceService
): Promise<string> => {
  const estimations = await estimationDistanceService.findAllEstimationsDistance();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation de la distance": object.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Estimations de la distance", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateEstimationsNombreExport = async (
  estimationNombreService: EstimationNombreService
): Promise<string> => {
  const estimations = await estimationNombreService.findAllEstimationsNombre();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation du nombre": object.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Estimations du nombre", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateLieuxDitsExport = async (lieuditService: LieuditService): Promise<string> => {
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

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Lieux-dits", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateMeteosExport = async (meteoService: MeteoService): Promise<string> => {
  const meteos = await meteoService.findAllMeteos();

  const objectsToExport = meteos.map((object) => {
    return {
      Météo: object.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Météos", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateMilieuxExport = async (milieuService: MilieuService): Promise<string> => {
  const milieuxDb = await milieuService.findAllMilieux();

  const milieuxToExport = milieuxDb.map((object) => {
    return {
      Code: object.code,
      Libellé: object.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(milieuxToExport, "Milieux", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateObservateursExport = async (observateurService: ObservateurService): Promise<string> => {
  const observateurs = await observateurService.findAllObservateurs();

  const objectsToExport = observateurs.map((object) => {
    return {
      Observateur: object.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Observateurs", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};

export const generateSexesExport = async (sexeService: SexeService): Promise<string> => {
  const sexes = await sexeService.findAllSexes();

  const objectsToExport = sexes.map((object) => {
    return {
      Sexe: object.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Sexes", path.join(PUBLIC_DIR_PATH.pathname, fileName));
  return fileName;
};
