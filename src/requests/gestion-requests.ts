import { HttpParameters } from "../http/httpParameters";
import { findClasseById } from "../model/helpers/classe.helper";
import { findCommuneById } from "../model/helpers/commune.helper";
import { findDepartementById } from "../model/helpers/departement.helper";
import { Age } from "../model/types/age.object";
import { Classe } from "../model/types/classe.object";
import { Commune } from "../model/types/commune.model";
import { Comportement } from "../model/types/comportement.object";
import { Departement } from "../model/types/departement.object";
import { Espece } from "../model/types/espece.model";
import { EstimationDistance } from "../model/types/estimation-distance.object";
import { EstimationNombre } from "../model/types/estimation-nombre.object";
import { Lieudit } from "../model/types/lieudit.model";
import { Meteo } from "../model/types/meteo.object";
import { Milieu } from "../model/types/milieu.object";
import { Observateur } from "../model/types/observateur.object";
import { PostResponse } from "../model/types/post-response.object";
import { Sexe } from "../model/types/sexe.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { findAllAges, persistAge } from "../services/entities/age-service";
import { findAllClasses, persistClasse } from "../services/entities/classe-service";
import { findAllCommunes, persistCommune } from "../services/entities/commune-service";
import { findAllComportements, persistComportement } from "../services/entities/comportement-service";
import { findAllDepartements, persistDepartement } from "../services/entities/departement-service";
import { countSpecimensByAgeForEspeceId, countSpecimensBySexeForEspeceId } from "../services/entities/donnee-service";
import { deleteEntityById } from "../services/entities/entity-service";
import { findAllEspeces, persistEspece } from "../services/entities/espece-service";
import { findAllEstimationsDistance, persistEstimationDistance } from "../services/entities/estimation-distance-service";
import { findAllEstimationsNombre, persistEstimationNombre } from "../services/entities/estimation-nombre-service";
import { findAllLieuxDits, persistLieuDit } from "../services/entities/lieu-dit-service";
import { findAllMeteos, persistMeteo } from "../services/entities/meteo-service";
import { findAllMilieux, persistMilieu } from "../services/entities/milieu-service";
import { deleteObservateur, findAllObservateurs, persistObservateur } from "../services/entities/observateur-service";
import { findAllSexes, persistSexe } from "../services/entities/sexe-service";
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

export const getObservateursRequest = async (): Promise<Observateur[]> => {
  return await findAllObservateurs();
};

export const saveObservateurRequest = async (
  httpParameters: HttpParameters<Observateur>
): Promise<PostResponse> => {
  const sqlResponse = await persistObservateur(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const removeObservateurRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const id: number = +httpParameters.query.id;
  const sqlResponse: SqlSaveResponse = await deleteObservateur(id);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getDepartementsRequest = async (): Promise<Departement[]> => {
  return await findAllDepartements();
};

export const saveDepartementRequest = async (
  httpParameters: HttpParameters<Departement>
): Promise<PostResponse> => {
  const sqlResponse = await persistDepartement(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteDepartementRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_DEPARTEMENT);
};

export const getCommunesRequest = async (): Promise<Commune[]> => {
  return await findAllCommunes();
};

export const saveCommuneRequest = async (
  httpParameters: HttpParameters<Commune>
): Promise<PostResponse> => {
  const sqlResponse = await persistCommune(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteCommuneRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_COMMUNE);
};

export const getLieuxditsRequest = async (): Promise<Lieudit[]> => {
  return findAllLieuxDits();
};

export const saveLieuditRequest = async (
  httpParameters: HttpParameters<Lieudit>
): Promise<PostResponse> => {
  const lieuditToSave = httpParameters.body;
  const sqlResponse = await persistLieuDit(lieuditToSave);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteLieuditRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_LIEUDIT);
};

export const getMeteosRequest = async (): Promise<Meteo[]> => {
  return await findAllMeteos();
};

export const saveMeteoRequest = async (
  httpParameters: HttpParameters<Meteo>
): Promise<PostResponse> => {
  const sqlResponse = await persistMeteo(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteMeteoRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_METEO);
};

export const getClassesRequest = async (): Promise<Classe[]> => {
  return await findAllClasses();
};

export const saveClasseRequest = async (
  httpParameters: HttpParameters<Classe>
): Promise<PostResponse> => {
  const sqlResponse = await persistClasse(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteClasseRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_CLASSE);
};

export const getEspecesRequest = async (): Promise<Espece[]> => {
  return await findAllEspeces();
};

export const saveEspeceRequest = async (
  httpParameters: HttpParameters<Espece>
): Promise<PostResponse> => {
  const sqlResponse = await persistEspece(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteEspeceRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESPECE);
};

export const getSexesRequest = async (): Promise<Sexe[]> => {
  return await findAllSexes();
};

export const saveSexeRequest = async (
  httpParameters: HttpParameters<Sexe>
): Promise<PostResponse> => {
  const sqlResponse = await persistSexe(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteSexeRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_SEXE);
};

export const getAgesRequest = async (): Promise<Age[]> => {
  return await findAllAges();
};

export const saveAgeRequest = async (
  httpParameters: HttpParameters<Age>
): Promise<PostResponse> => {
  const sqlResponse = await persistAge(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteAgeRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_AGE);
};

export const getEstimationsNombreRequest = async (): Promise<EstimationNombre[]> => {
  return await findAllEstimationsNombre();
};

export const saveEstimationNombreRequest = async (
  httpParameters: HttpParameters<EstimationNombre>
): Promise<PostResponse> => {
  const sqlResponse = await persistEstimationNombre(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteEstimationNombreRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_NOMBRE);
};

export const getEstimationsDistanceRequest = async (): Promise<
  EstimationDistance[]
> => {
  return await findAllEstimationsDistance();
};

export const saveEstimationDistanceRequest = async (
  httpParameters: HttpParameters<EstimationDistance>
): Promise<PostResponse> => {
  const sqlResponse = await persistEstimationDistance(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteEstimationDistanceRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_DISTANCE);
};

export const getComportementsRequest = async (): Promise<Comportement[]> => {
  return await findAllComportements();
};

export const saveComportementRequest = async (
  httpParameters: HttpParameters<Comportement>
): Promise<PostResponse> => {
  const sqlResponse = await persistComportement(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteComportementRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_COMPORTEMENT);
};

export const getMilieuxRequest = async (): Promise<Milieu[]> => {
  return await findAllMilieux();
};

export const saveMilieuRequest = async (
  httpParameters: HttpParameters<Milieu>
): Promise<PostResponse> => {
  const sqlResponse = await persistMilieu(httpParameters.body);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteMilieuRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_MILIEU);
};

export const exportObservateursRequest = async (): Promise<unknown> => {
  const observateurs: Observateur[] = await findAllObservateurs();

  const objectsToExport = observateurs.map((object) => {
    return {
      Observateur: object.libelle
    };
  });

  return writeToExcel(objectsToExport, [], "Observateurs");
};

export const exportMeteosRequest = async (): Promise<unknown> => {
  const meteos: Meteo[] = await findAllMeteos();

  const objectsToExport = meteos.map((object) => {
    return {
      Météo: object.libelle
    };
  });

  return writeToExcel(objectsToExport, [], "Météos");
};

export const exportDepartementsRequest = async (): Promise<unknown> => {
  const departementsDb: Departement[] = await getDepartementsRequest();

  const objectsToExport = departementsDb.map((object) => {
    return {
      Département: object.code
    };
  });

  return writeToExcel(objectsToExport, [], "Départements");
};

export const exportCommunesRequest = async (): Promise<unknown> => {
  const communesDb: Commune[] = await findAllCommunes();
  const departements: Departement[] = await findAllDepartements();

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
      Latitude: lieudit.coordinates.latitude,
      Longitude: lieudit.coordinates.longitude,
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
      Classe: findClasseById(classes, espece.classeId).libelle,
      Code: espece.code,
      "Nom français": espece.nomFrancais,
      "Nom scientifique": espece.nomLatin
    };
  });

  return writeToExcel(objectsToExport, [], "Espèces");
};

export const exportAgesRequest = async (): Promise<unknown> => {
  const agesDb: Age[] = await findAllAges();

  const agesToExport = agesDb.map((ageDb) => {
    return { Âge: ageDb.libelle };
  });

  return writeToExcel(agesToExport, [], "Âges");
};

export const exportSexesRequest = async (): Promise<unknown> => {
  const sexes: Sexe[] = await findAllSexes();

  const objectsToExport = sexes.map((object) => {
    return { Sexe: object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Sexes");
};

export const exportEstimationsNombreRequest = async (): Promise<unknown> => {
  const estimations: EstimationNombre[] = await findAllEstimationsNombre();

  const objectsToExport = estimations.map((object) => {
    return { "Estimation du nombre": object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Estimations du nombre");
};

export const exportEstimationsDistanceRequest = async (): Promise<unknown> => {
  const estimations: EstimationDistance[] = await findAllEstimationsDistance();

  const objectsToExport = estimations.map((object) => {
    return { "Estimation de la distance": object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Estimations de la distance");
};

export const exportComportementsRequest = async (): Promise<unknown> => {
  const comportementsDb: Comportement[] = await findAllComportements();

  const comportementsToExport = comportementsDb.map((object) => {
    return { Code: object.code, Libellé: object.libelle };
  });

  return writeToExcel(comportementsToExport, [], "Comportements");
};

export const exportMilieuxRequest = async (): Promise<unknown> => {
  const milieuxDb: Milieu[] = await findAllMilieux();

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
