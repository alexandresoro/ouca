import { HttpParameters } from "../http/httpParameters";
import { Age, AgeWithCounts, Commune, Comportement, ComportementWithCounts, Departement, DepartementWithCounts, EstimationDistance, EstimationDistanceWithCounts, EstimationNombre, EstimationNombreWithCounts, Meteo, MeteoWithCounts, Milieu, MilieuWithCounts, Observateur, ObservateurWithCounts, Sexe, SexeWithCounts } from "../model/graphql";
import { findCommuneById } from "../model/helpers/commune.helper";
import { findDepartementById } from "../model/helpers/departement.helper";
import { Classe } from "../model/types/classe.object";
import { Espece } from "../model/types/espece.model";
import { Lieudit } from "../model/types/lieudit.model";
import { PostResponse } from "../model/types/post-response.object";
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

export const getObservateursRequest = async (): Promise<ObservateurWithCounts[]> => {
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

export const getDepartementsRequest = async (): Promise<DepartementWithCounts[]> => {
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

export const getCommunesRequest = async (): Promise<Omit<Commune, 'departement'>[]> => {
  return await findAllCommunes();
};

export const saveCommuneRequest = async (
  httpParameters: HttpParameters<Omit<Commune, 'departement'> & { departementId: number }>
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

export const getMeteosRequest = async (): Promise<MeteoWithCounts[]> => {
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

export const getSexesRequest = async (): Promise<SexeWithCounts[]> => {
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

export const getAgesRequest = async (): Promise<AgeWithCounts[]> => {
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

export const getEstimationsNombreRequest = async (): Promise<EstimationNombreWithCounts[]> => {
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
  EstimationDistanceWithCounts[]
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

export const getComportementsRequest = async (): Promise<ComportementWithCounts[]> => {
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

export const getMilieuxRequest = async (): Promise<MilieuWithCounts[]> => {
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
