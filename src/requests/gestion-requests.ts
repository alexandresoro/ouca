import { HttpParameters } from "../http/httpParameters";
import { AgeWithCounts, ComportementWithCounts, DepartementWithCounts, MeteoWithCounts, MilieuWithCounts, ObservateurWithCounts, SexeWithCounts } from "../model/graphql";
import { findCommuneById } from "../model/helpers/commune.helper";
import { findDepartementById } from "../model/helpers/departement.helper";
import { Classe } from "../model/types/classe.object";
import { Espece } from "../model/types/espece.model";
import { findAllAges } from "../services/entities/age-service";
import { findAllClasses } from "../services/entities/classe-service";
import { findAllCommunes } from "../services/entities/commune-service";
import { findAllComportements } from "../services/entities/comportement-service";
import { findAllDepartements } from "../services/entities/departement-service";
import { countSpecimensByAgeForEspeceId, countSpecimensBySexeForEspeceId } from "../services/entities/donnee-service";
import { findAllEspeces } from "../services/entities/espece-service";
import { findAllEstimationsDistance } from "../services/entities/estimation-distance-service";
import { findAllEstimationsNombre } from "../services/entities/estimation-nombre-service";
import { findAllLieuxDits } from "../services/entities/lieu-dit-service";
import { findAllMeteos } from "../services/entities/meteo-service";
import { findAllMilieux } from "../services/entities/milieu-service";
import { findAllObservateurs } from "../services/entities/observateur-service";
import { findAllSexes } from "../services/entities/sexe-service";
import { writeToExcel } from "../utils/export-excel-utils";

export const getDepartementsRequest = async (): Promise<DepartementWithCounts[]> => {
  return await findAllDepartements();
};

export const exportObservateursRequest = async (): Promise<unknown> => {
  const observateurs: ObservateurWithCounts[] = await findAllObservateurs();

  const objectsToExport = observateurs.map((object) => {
    return {
      Observateur: object.libelle
    };
  });

  return writeToExcel(objectsToExport, [], "Observateurs");
};

export const exportMeteosRequest = async (): Promise<unknown> => {
  const meteos: MeteoWithCounts[] = await findAllMeteos();

  const objectsToExport = meteos.map((object) => {
    return {
      Météo: object.libelle
    };
  });

  return writeToExcel(objectsToExport, [], "Météos");
};

export const exportDepartementsRequest = async (): Promise<unknown> => {
  const departementsDb: DepartementWithCounts[] = await getDepartementsRequest();

  const objectsToExport = departementsDb.map((object) => {
    return {
      Département: object.code
    };
  });

  return writeToExcel(objectsToExport, [], "Départements");
};

export const exportCommunesRequest = async (): Promise<unknown> => {
  const communesDb = await findAllCommunes();
  const departements: DepartementWithCounts[] = await findAllDepartements();

  const objectsToExport = communesDb.map((communeDb) => {
    return {
      Département: findDepartementById(departements, communeDb.departementId)
        .code,
      Code: communeDb.code,
      Nom: communeDb.nom
    };
  });

  return writeToExcel(objectsToExport, [], "Communes");
};

export const exportLieuxditsRequest = async (): Promise<unknown> => {
  const [lieuxdits, communes, departements] = await Promise.all([
    findAllLieuxDits(),
    findAllCommunes(),
    findAllDepartements()
  ]);

  const objectsToExport = lieuxdits.map((lieudit) => {
    const commune = findCommuneById(communes, lieudit.communeId);
    return {
      Département: findDepartementById(departements, commune.departementId)
        .code,
      "Code commune": commune.code,
      "Nom commune": commune.nom,
      "Lieu-dit": lieudit.nom,
      Latitude: lieudit.latitude,
      Longitude: lieudit.longitude,
      Altitude: lieudit.altitude
    };
  });

  return writeToExcel(objectsToExport, [], "Lieux-dits");
};

export const exportClassesRequest = async (): Promise<unknown> => {
  const classes: Classe[] = await findAllClasses();

  const objectsToExport = classes.map((object) => {
    return { Classe: object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Classes");
};

export const exportEspecesRequest = async (): Promise<unknown> => {
  const especes: Espece[] = await findAllEspeces();
  const classes: Classe[] = await findAllClasses();

  const objectsToExport = especes.map((espece) => {
    return {
      Classe: classes?.find(({ id }) => id === espece.classeId)?.libelle,
      Code: espece.code,
      "Nom français": espece.nomFrancais,
      "Nom scientifique": espece.nomLatin
    };
  });

  return writeToExcel(objectsToExport, [], "Espèces");
};

export const exportAgesRequest = async (): Promise<unknown> => {
  const agesDb: AgeWithCounts[] = await findAllAges();

  const agesToExport = agesDb.map((ageDb) => {
    return { Âge: ageDb.libelle };
  });

  return writeToExcel(agesToExport, [], "Âges");
};

export const exportSexesRequest = async (): Promise<unknown> => {
  const sexes: SexeWithCounts[] = await findAllSexes();

  const objectsToExport = sexes.map((object) => {
    return { Sexe: object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Sexes");
};

export const exportEstimationsNombreRequest = async (): Promise<unknown> => {
  const estimations = await findAllEstimationsNombre();

  const objectsToExport = estimations.map((object) => {
    return { "Estimation du nombre": object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Estimations du nombre");
};

export const exportEstimationsDistanceRequest = async (): Promise<unknown> => {
  const estimations = await findAllEstimationsDistance();

  const objectsToExport = estimations.map((object) => {
    return { "Estimation de la distance": object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Estimations de la distance");
};

export const exportComportementsRequest = async (): Promise<unknown> => {
  const comportementsDb: ComportementWithCounts[] = await findAllComportements();

  const comportementsToExport = comportementsDb.map((object) => {
    return { Code: object.code, Libellé: object.libelle };
  });

  return writeToExcel(comportementsToExport, [], "Comportements");
};

export const exportMilieuxRequest = async (): Promise<unknown> => {
  const milieuxDb: MilieuWithCounts[] = await findAllMilieux();

  const milieuxToExport = milieuxDb.map((object) => {
    return { Code: object.code, Libellé: object.libelle };
  });

  return writeToExcel(milieuxToExport, [], "Milieux");
};

export const getEspeceDetailsByAgeRequest = (
  httpParameters: HttpParameters
): Promise<{ name: string; value: number }[]> => {
  const especeId: number = +httpParameters.query.id;
  return countSpecimensByAgeForEspeceId(especeId);
};

export const getEspeceDetailsBySexeRequest = (
  httpParameters: HttpParameters
): Promise<{ name: string; value: number }[]> => {
  const especeId: number = +httpParameters.query.id;
  return countSpecimensBySexeForEspeceId(especeId);
};
