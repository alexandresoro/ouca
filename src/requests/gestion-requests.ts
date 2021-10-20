import { HttpParameters } from "../http/httpParameters";
import { AgeWithCounts, Commune, ComportementWithCounts, DepartementWithCounts, EstimationDistanceWithCounts, EstimationNombreWithCounts, LieuDit, MeteoWithCounts, MilieuWithCounts, ObservateurWithCounts, SexeWithCounts } from "../model/graphql";
import { findCommuneById } from "../model/helpers/commune.helper";
import { findDepartementById } from "../model/helpers/departement.helper";
import { Classe } from "../model/types/classe.object";
import { Espece } from "../model/types/espece.model";
import { PostResponse } from "../model/types/post-response.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { findAllAges } from "../services/entities/age-service";
import { findAllClasses } from "../services/entities/classe-service";
import { findAllCommunes, findAllCommunesWithCounts } from "../services/entities/commune-service";
import { findAllComportements } from "../services/entities/comportement-service";
import { findAllDepartements } from "../services/entities/departement-service";
import { countSpecimensByAgeForEspeceId, countSpecimensBySexeForEspeceId } from "../services/entities/donnee-service";
import { deleteEntityById } from "../services/entities/entity-service";
import { findAllEspeces } from "../services/entities/espece-service";
import { findAllEstimationsDistance } from "../services/entities/estimation-distance-service";
import { findAllEstimationsNombre } from "../services/entities/estimation-nombre-service";
import { findAllLieuxDits, findAllLieuxDitsWithCounts } from "../services/entities/lieu-dit-service";
import { findAllMeteos } from "../services/entities/meteo-service";
import { findAllMilieux } from "../services/entities/milieu-service";
import { deleteObservateur, findAllObservateurs } from "../services/entities/observateur-service";
import { findAllSexes } from "../services/entities/sexe-service";
import { TABLE_AGE, TABLE_CLASSE, TABLE_COMMUNE, TABLE_COMPORTEMENT, TABLE_DEPARTEMENT, TABLE_ESPECE, TABLE_ESTIMATION_DISTANCE, TABLE_ESTIMATION_NOMBRE, TABLE_LIEUDIT, TABLE_METEO, TABLE_MILIEU, TABLE_SEXE } from "../utils/constants";
import { writeToExcel } from "../utils/export-excel-utils";
import { buildPostResponseFromSqlResponse } from "../utils/post-response-utils";

const deleteEntity = async (
  httpParameters: HttpParameters,
  entityName: string
): Promise<PostResponse> => {
  const id: number = +httpParameters.query.id;
  const sqlResponse: SqlSaveResponse = await deleteEntityById(entityName, id);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getObservateursRequest = async (): Promise<ObservateurWithCounts[]> => {
  return await findAllObservateurs();
};

export const removeObservateurRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const id: number = +httpParameters.query.id;
  const sqlResponse: SqlSaveResponse = await deleteObservateur(id);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getDepartementsRequest = async (): Promise<DepartementWithCounts[]> => {
  return await findAllDepartements();
};

export const deleteDepartementRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_DEPARTEMENT);
};

export const getCommunesRequest = async (): Promise<Omit<Commune, 'departement'>[]> => {
  return await findAllCommunesWithCounts();
};

export const deleteCommuneRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_COMMUNE);
};

export const getLieuxditsRequest = async (): Promise<Omit<LieuDit, 'commune'>[]> => {
  return findAllLieuxDitsWithCounts();
};

export const deleteLieuditRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_LIEUDIT);
};

export const getMeteosRequest = async (): Promise<MeteoWithCounts[]> => {
  return await findAllMeteos();
};

export const deleteMeteoRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_METEO);
};

export const getClassesRequest = async (): Promise<Classe[]> => {
  return await findAllClasses();
};

export const deleteClasseRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_CLASSE);
};

export const deleteEspeceRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESPECE);
};

export const getSexesRequest = async (): Promise<SexeWithCounts[]> => {
  return await findAllSexes();
};

export const deleteSexeRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_SEXE);
};

export const getAgesRequest = async (): Promise<AgeWithCounts[]> => {
  return await findAllAges();
};

export const deleteAgeRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_AGE);
};

export const getEstimationsNombreRequest = async (): Promise<EstimationNombreWithCounts[]> => {
  return await findAllEstimationsNombre();
};

export const deleteEstimationNombreRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_NOMBRE);
};

export const getEstimationsDistanceRequest = async (): Promise<
  EstimationDistanceWithCounts[]
> => {
  return await findAllEstimationsDistance();
};

export const deleteEstimationDistanceRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_DISTANCE);
};

export const getComportementsRequest = async (): Promise<ComportementWithCounts[]> => {
  return await findAllComportements();
};

export const deleteComportementRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_COMPORTEMENT);
};

export const getMilieuxRequest = async (): Promise<MilieuWithCounts[]> => {
  return await findAllMilieux();
};

export const deleteMilieuRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_MILIEU);
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
