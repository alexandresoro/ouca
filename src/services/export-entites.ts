import { randomUUID } from "crypto";
import path from "path";
import { GPS_COORDINATES } from "../model/coordinates-system/gps.object";
import { SearchDonneeCriteria } from "../model/graphql";
import { getNicheurStatusToDisplay } from "../model/helpers/nicheur-helper";
import { SEPARATOR_COMMA } from "../utils/constants";
import { writeToExcelFile } from "../utils/export-excel-utils";
import { PUBLIC_DIR } from "../utils/paths";
import { findAges } from "./entities/age-service";
import { findClasses } from "./entities/classe-service";
import { findAllCommunesWithDepartements } from "./entities/commune-service";
import { findAllComportements } from "./entities/comportement-service";
import { findAllDepartements } from "./entities/departement-service";
import { DonneeWithRelations, findDonneesByCriteria } from "./entities/donnee-service";
import { findAllEspecesWithClasses } from "./entities/espece-service";
import { findAllEstimationsDistance } from "./entities/estimation-distance-service";
import { findAllEstimationsNombre } from "./entities/estimation-nombre-service";
import { findAllLieuxDitsWithCommuneAndDepartement } from "./entities/lieu-dit-service";
import { findMeteos } from "./entities/meteo-service";
import { findAllMilieux } from "./entities/milieu-service";
import { findObservateurs } from "./entities/observateur-service";
import { findSexes } from "./entities/sexe-service";

export const generateAgesExport = async (): Promise<string> => {
  const agesDb = await findAges();

  const agesToExport = agesDb.map((ageDb) => {
    return {
      Âge: ageDb.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(agesToExport, "Âges", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateClassesExport = async (): Promise<string> => {
  const classes = await findClasses();

  const objectsToExport = classes.map((object) => {
    return { Classe: object.libelle };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Classes", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateCommunesExport = async (): Promise<string> => {
  const communesDb = await findAllCommunesWithDepartements();

  const objectsToExport = communesDb.map((communeDb) => {
    return {
      Département: communeDb.departement.code,
      Code: communeDb.code,
      Nom: communeDb.nom
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Communes", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateComportementsExport = async (): Promise<string> => {
  const comportementsDb = await findAllComportements();

  const comportementsToExport = comportementsDb.map((object) => {
    return {
      Code: object.code,
      Libellé: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(comportementsToExport, "Comportements", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateDepartementsExport = async (): Promise<string> => {
  const departementsDb = await findAllDepartements();

  const objectsToExport = departementsDb.map((object) => {
    return {
      Département: object.code
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
      Commentaires: donnee.commentaire
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "donnees", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateEspecesExport = async (): Promise<string> => {
  const especes = await findAllEspecesWithClasses();

  const objectsToExport = especes.map((espece) => {
    return {
      Classe: espece.classe?.libelle,
      Code: espece.code,
      "Nom français": espece.nomFrancais,
      "Nom scientifique": espece.nomLatin
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Espèces", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateEstimationsDistanceExport = async (): Promise<string> => {
  const estimations = await findAllEstimationsDistance();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation de la distance": object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Estimations de la distance", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateEstimationsNombreExport = async (): Promise<string> => {
  const estimations = await findAllEstimationsNombre();

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation du nombre": object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Estimations du nombre", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateLieuxDitsExport = async (): Promise<string> => {
  const lieuxDits = await findAllLieuxDitsWithCommuneAndDepartement();

  const objectsToExport = lieuxDits.map((lieudit) => {
    return {
      Département: lieudit.commune.departement.code,
      "Code commune": lieudit.commune.code,
      "Nom commune": lieudit.commune.nom,
      "Lieu-dit": lieudit.nom,
      Latitude: lieudit.latitude,
      Longitude: lieudit.longitude,
      Altitude: lieudit.altitude
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Lieux-dits", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateMeteosExport = async (): Promise<string> => {
  const meteos = await findMeteos();

  const objectsToExport = meteos.map((object) => {
    return {
      Météo: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Météos", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateMilieuxExport = async (): Promise<string> => {
  const milieuxDb = await findAllMilieux();

  const milieuxToExport = milieuxDb.map((object) => {
    return {
      Code: object.code,
      Libellé: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(milieuxToExport, "Milieux", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateObservateursExport = async (): Promise<string> => {
  const observateurs = await findObservateurs();

  const objectsToExport = observateurs.map((object) => {
    return {
      Observateur: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Observateurs", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateSexesExport = async (): Promise<string> => {
  const sexes = await findSexes();

  const objectsToExport = sexes.map((object) => {
    return {
      Sexe: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "Sexes", path.join(PUBLIC_DIR, fileName));
  return fileName;
};
