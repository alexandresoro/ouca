import { randomUUID } from 'crypto';
import path from 'path';
import { writeToExcelFile } from '../utils/export-excel-utils';
import { PUBLIC_DIR } from '../utils/paths';
import { findAllAges } from './entities/age-service';
import { findAllClasses } from './entities/classe-service';
import { findAllCommunesWithDepartements } from './entities/commune-service';
import { findAllComportements } from './entities/comportement-service';
import { findAllDepartements } from "./entities/departement-service";
import { findAllEspecesWithClasses } from './entities/espece-service';
import { findAllEstimationsDistance } from './entities/estimation-distance-service';
import { findAllEstimationsNombre } from './entities/estimation-nombre-service';
import { findAllLieuxDitsWithCommuneAndDepartement } from './entities/lieu-dit-service';
import { findAllMeteos } from './entities/meteo-service';
import { findAllMilieux } from './entities/milieu-service';
import { findAllObservateurs } from './entities/observateur-service';
import { findAllSexes } from './entities/sexe-service';

export const generateAgesExport = async (): Promise<string> => {
  const agesDb = await findAllAges({ includeCounts: false });

  const agesToExport = agesDb.map((ageDb) => {
    return {
      Âge: ageDb.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(agesToExport, [], "Âges", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateClassesExport = async (): Promise<string> => {
  const classes = await findAllClasses();

  const objectsToExport = classes.map((object) => {
    return { Classe: object.libelle };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Classes", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, [], "Communes", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(comportementsToExport, [], "Comportements", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateDepartementsExport = async (): Promise<string> => {
  const departementsDb = await findAllDepartements({ includeCounts: false });

  const objectsToExport = departementsDb.map((object) => {
    return {
      Département: object.code
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Départements", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateEspecesExport = async (): Promise<string> => {
  const especes = await findAllEspecesWithClasses();

  const objectsToExport = especes.map((espece) => {
    return {
      Classe: espece.classe.libelle,
      Code: espece.code,
      "Nom français": espece.nomFrancais,
      "Nom scientifique": espece.nomLatin
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Espèces", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, [], "Estimations de la distance", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateEstimationsNombreExport = async (): Promise<string> => {
  const estimations = await findAllEstimationsNombre({ includeCounts: false });

  const objectsToExport = estimations.map((object) => {
    return {
      "Estimation du nombre": object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Estimations du nombre", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(objectsToExport, [], "Lieux-dits", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateMeteosExport = async (): Promise<string> => {
  const meteos = await findAllMeteos();

  const objectsToExport = meteos.map((object) => {
    return {
      Météo: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Météos", path.join(PUBLIC_DIR, fileName));
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
  await writeToExcelFile(milieuxToExport, [], "Milieux", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateObservateursExport = async (): Promise<string> => {
  const observateurs = await findAllObservateurs(false);

  const objectsToExport = observateurs.map((object) => {
    return {
      Observateur: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Observateurs", path.join(PUBLIC_DIR, fileName));
  return fileName;
};

export const generateSexesExport = async (): Promise<string> => {
  const sexes = await findAllSexes({ includeCounts: false });

  const objectsToExport = sexes.map((object) => {
    return {
      Sexe: object.libelle
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Sexes", path.join(PUBLIC_DIR, fileName));
  return fileName;
};
