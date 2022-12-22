import { randomUUID } from "node:crypto";
import path from "node:path";
import { type SearchDonneeCriteria } from "../graphql/generated/graphql-types";
import { GPS_COORDINATES } from "../model/coordinates-system/gps.object";
import { getNicheurStatusToDisplay } from "../model/helpers/nicheur-helper";
import { SEPARATOR_COMMA } from "../utils/constants";
import { writeToExcelFile } from "../utils/export-excel-utils";
import { PUBLIC_DIR } from "../utils/paths";
import { type AgeService } from "./entities/age-service";
import { type ClasseService } from "./entities/classe-service";
import { type CommuneService } from "./entities/commune-service";
import { type ComportementService } from "./entities/comportement-service";
import { type DepartementService } from "./entities/departement-service";
import { findDonneesByCriteria, type DonneeWithRelations } from "./entities/donnee-service";
import { type EspeceService } from "./entities/espece-service";
import { type EstimationDistanceService } from "./entities/estimation-distance-service";
import { type EstimationNombreService } from "./entities/estimation-nombre-service";
import { type LieuditService } from "./entities/lieu-dit-service";
import { type MeteoService } from "./entities/meteo-service";
import { type MilieuService } from "./entities/milieu-service";
import { type ObservateurService } from "./entities/observateur-service";
import { type SexeService } from "./entities/sexe-service";

export const generateAgesExport = async (ageService: AgeService): Promise<string> => {
  const agesDb = await ageService.findAllAges();

  const agesToExport = agesDb.map((ageDb) => {
    return {
      Âge: ageDb.libelle,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(agesToExport, "Âges", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateClassesExport = async (classeService: ClasseService): Promise<string> => {
  const classes = await classeService.findAllClasses();

  const objectsToExport = classes.map((object) => {
    return { Classe: object.libelle };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Classes", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Communes", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(comportementsToExport, "Comportements", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Départements", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

const getComportement = (donnee: DonneeWithRelations, index: number): string => {
  return donnee.comportements.length >= index
    ? donnee.comportements[index - 1].code + " - " + donnee.comportements[index - 1].libelle
    : "";
};

const getMilieu = (donnee: DonneeWithRelations, index: number): string => {
  return donnee.milieux.length >= index
    ? donnee.milieux[index - 1].code + " - " + donnee.milieux[index - 1].libelle
    : "";
};

export const generateDonneesExport = async (
  searchCriteria: SearchDonneeCriteria | null | undefined
): Promise<string> => {
  const coordinatesSystem = GPS_COORDINATES;
  const coordinatesSuffix = " en " + coordinatesSystem.unitName + " (" + coordinatesSystem.name + ")";

  const donnees = await findDonneesByCriteria(searchCriteria);

  const objectsToExport = donnees.map((donnee) => {
    const nicheurStatus = getNicheurStatusToDisplay(donnee.comportements, "");

    return {
      ID: donnee.id,
      Observateur: donnee.inventaire.observateur.libelle,
      "Observateurs associés":
        donnee.inventaire.associes?.map((associe) => associe?.libelle)?.join(SEPARATOR_COMMA) ?? "",
      Date: donnee.inventaire.date,
      Heure: donnee.inventaire.heure,
      Durée: donnee.inventaire.duree,
      Département: donnee.inventaire.lieuDit.commune.departement.code,
      "Code commune": donnee.inventaire.lieuDit.commune.code,
      "Nom commune": donnee.inventaire.lieuDit.commune.nom,
      "Lieu-dit": donnee.inventaire.lieuDit.nom,
      ["Latitude" + coordinatesSuffix]:
        donnee.inventaire.latitude?.toNumber() ?? donnee.inventaire.lieuDit.latitude?.toNumber(),
      ["Longitude" + coordinatesSuffix]:
        donnee.inventaire.longitude?.toNumber() ?? donnee.inventaire.lieuDit.longitude?.toNumber(),
      "Altitude en mètres": donnee.inventaire.altitude ?? donnee.inventaire.lieuDit.altitude,
      "Température en °C": donnee.inventaire.temperature,
      Météo: donnee.inventaire.meteos?.map((meteo) => meteo?.libelle)?.join(SEPARATOR_COMMA) ?? "",
      Classe: donnee.espece.classe?.libelle,
      "Code espèce": donnee.espece.code,
      "Nom francais": donnee.espece.nomFrancais,
      "Nom scientifique": donnee.espece.nomLatin,
      Sexe: donnee.sexe.libelle,
      Âge: donnee.age.libelle,
      "Nombre d'individus": donnee.nombre,
      "Estimation du nombre": donnee.estimationNombre?.libelle,
      "Estimation de la distance": donnee.estimationDistance?.libelle,
      "Distance en mètres": donnee.distance,
      "Numéro de regroupement": donnee.regroupement,
      Nicheur: nicheurStatus,
      "Comportement 1": getComportement(donnee, 1),
      "Comportement 2": getComportement(donnee, 2),
      "Comportement 3": getComportement(donnee, 3),
      "Comportement 4": getComportement(donnee, 4),
      "Comportement 5": getComportement(donnee, 5),
      "Comportement 6": getComportement(donnee, 6),
      "Milieu 1": getMilieu(donnee, 1),
      "Milieu 2": getMilieu(donnee, 2),
      "Milieu 3": getMilieu(donnee, 3),
      "Milieu 4": getMilieu(donnee, 4),
      Commentaires: donnee.commentaire,
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "donnees", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Espèces", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Estimations de la distance", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Estimations du nombre", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Lieux-dits", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Météos", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(milieuxToExport, "Milieux", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Observateurs", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, "Sexes", path.join(PUBLIC_DIR, fileName));
  return fileName;
};
