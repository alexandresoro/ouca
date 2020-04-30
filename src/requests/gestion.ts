import * as _ from "lodash";
import { Age } from "ouca-common/age.object";
import { Classe } from "ouca-common/classe.object";
import { Commune } from "ouca-common/commune.model";
import { Comportement } from "ouca-common/comportement.object";
import { Departement } from "ouca-common/departement.object";
import { Espece } from "ouca-common/espece.model";
import { EstimationDistance } from "ouca-common/estimation-distance.object";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { findClasseById } from "ouca-common/helpers/classe.helper";
import { findCommuneById } from "ouca-common/helpers/commune.helper";
import { findDepartementById } from "ouca-common/helpers/departement.helper";
import { Lieudit } from "ouca-common/lieudit.model";
import { Meteo } from "ouca-common/meteo.object";
import { Milieu } from "ouca-common/milieu.object";
import { Observateur } from "ouca-common/observateur.object";
import { PostResponse } from "ouca-common/post-response.object";
import { Sexe } from "ouca-common/sexe.object";
import { HttpParameters } from "../http/httpParameters";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { findAllAges, persistAge } from "../sql-api/sql-api-age";
import { findAllClasses, persistClasse } from "../sql-api/sql-api-classe";
import { deleteEntityById } from "../sql-api/sql-api-common";
import { findAllCommunes, persistCommune } from "../sql-api/sql-api-commune";
import {
  findAllComportements,
  persistComportement
} from "../sql-api/sql-api-comportement";
import {
  findAllDepartements,
  persistDepartement
} from "../sql-api/sql-api-departement";
import {
  countSpecimensByAgeForEspeceId,
  countSpecimensBySexeForEspeceId
} from "../sql-api/sql-api-donnee";
import { findAllEspeces, persistEspece } from "../sql-api/sql-api-espece";
import {
  findAllEstimationsDistance,
  persistEstimationDistance
} from "../sql-api/sql-api-estimation-distance";
import {
  findAllEstimationsNombre,
  persistEstimationNombre
} from "../sql-api/sql-api-estimation-nombre";
import { findAllLieuxDits, persistLieuDit } from "../sql-api/sql-api-lieudit";
import { findAllMeteos, persistMeteo } from "../sql-api/sql-api-meteo";
import { findAllMilieux, persistMilieu } from "../sql-api/sql-api-milieu";
import {
  deleteObservateur,
  findAllObservateurs,
  persistObservateur
} from "../sql-api/sql-api-observateur";
import { findAllSexes, persistSexe } from "../sql-api/sql-api-sexe";
import {
  TABLE_AGE,
  TABLE_CLASSE,
  TABLE_COMMUNE,
  TABLE_COMPORTEMENT,
  TABLE_DEPARTEMENT,
  TABLE_ESPECE,
  TABLE_ESTIMATION_DISTANCE,
  TABLE_ESTIMATION_NOMBRE,
  TABLE_LIEUDIT,
  TABLE_METEO,
  TABLE_MILIEU,
  TABLE_SEXE
} from "../utils/constants";
import { writeToExcel } from "../utils/export-excel-utils";
import { buildPostResponseFromSqlResponse } from "../utils/post-response-utils";

const deleteEntity = async (
  httpParameters: HttpParameters,
  entityName: string
): Promise<PostResponse> => {
  const id: number = +httpParameters.queryParameters.id;
  const sqlResponse: SqlSaveResponse = await deleteEntityById(entityName, id);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getObservateurs = async (): Promise<Observateur[]> => {
  return await findAllObservateurs();
};

export const saveObservateur = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistObservateur(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const removeObservateur = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const id: number = +httpParameters.queryParameters.id;
  const sqlResponse: SqlSaveResponse = await deleteObservateur(id);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getDepartements = async (): Promise<Departement[]> => {
  return await findAllDepartements();
};

export const saveDepartement = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistDepartement(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteDepartement = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_DEPARTEMENT);
};

export const getCommunes = async (): Promise<Commune[]> => {
  return await findAllCommunes();
};

export const saveCommune = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistCommune(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteCommune = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_COMMUNE);
};

export const getLieuxdits = async (): Promise<Lieudit[]> => {
  return findAllLieuxDits();
};

export const saveLieudit = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const lieuditToSave: Lieudit = httpParameters.postData;
  const sqlResponse = await persistLieuDit(lieuditToSave);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteLieudit = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_LIEUDIT);
};

export const getMeteos = async (): Promise<Meteo[]> => {
  return await findAllMeteos();
};

export const saveMeteo = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistMeteo(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteMeteo = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_METEO);
};

export const getClasses = async (): Promise<Classe[]> => {
  return await findAllClasses();
};

export const saveClasse = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistClasse(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteClasse = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_CLASSE);
};

export const getEspeces = async (): Promise<Espece[]> => {
  return await findAllEspeces();
};

export const saveEspece = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistEspece(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteEspece = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESPECE);
};

export const getSexes = async (): Promise<Sexe[]> => {
  return await findAllSexes();
};

export const saveSexe = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistSexe(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteSexe = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_SEXE);
};

export const getAges = async (): Promise<Age[]> => {
  return await findAllAges();
};

export const saveAge = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistAge(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteAge = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_AGE);
};

export const getEstimationsNombre = async (): Promise<EstimationNombre[]> => {
  return await findAllEstimationsNombre();
};

export const saveEstimationNombre = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistEstimationNombre(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteEstimationNombre = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_NOMBRE);
};

export const getEstimationsDistance = async (): Promise<
  EstimationDistance[]
> => {
  return await findAllEstimationsDistance();
};

export const saveEstimationDistance = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistEstimationDistance(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteEstimationDistance = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_DISTANCE);
};

export const getComportements = async (): Promise<Comportement[]> => {
  return await findAllComportements();
};

export const saveComportement = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistComportement(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteComportement = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_COMPORTEMENT);
};

export const getMilieux = async (): Promise<Milieu[]> => {
  return await findAllMilieux();
};

export const saveMilieu = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const sqlResponse = await persistMilieu(httpParameters.postData);
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const deleteMilieu = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_MILIEU);
};

export const exportObservateurs = async (): Promise<unknown> => {
  const observateurs: Observateur[] = await getObservateurs();

  const objectsToExport = _.map(observateurs, (object) => {
    return {
      Observateur: object.libelle
    };
  });

  return writeToExcel(objectsToExport, [], "Observateurs");
};

export const exportMeteos = async (): Promise<unknown> => {
  const meteos: Meteo[] = await getMeteos();

  const objectsToExport = _.map(meteos, (object) => {
    return {
      Météo: object.libelle
    };
  });

  return writeToExcel(objectsToExport, [], "Météos");
};

export const exportDepartements = async (): Promise<unknown> => {
  const departementsDb: Departement[] = await getDepartements();

  const objectsToExport = _.map(departementsDb, (object) => {
    return {
      Département: object.code
    };
  });

  return writeToExcel(objectsToExport, [], "Départements");
};

export const exportCommunes = async (): Promise<unknown> => {
  const communesDb: Commune[] = await getCommunes();
  const departements: Departement[] = await getDepartements();

  const objectsToExport = _.map(communesDb, (communeDb) => {
    return {
      Département: findDepartementById(departements, communeDb.departementId),
      Code: communeDb.code,
      Nom: communeDb.nom
    };
  });

  return writeToExcel(objectsToExport, [], "Communes");
};

export const exportLieuxdits = async (): Promise<unknown> => {
  const [lieuxdits, communes, departements] = await Promise.all([
    findAllLieuxDits(),
    findAllCommunes(),
    findAllDepartements()
  ]);

  const objectsToExport = _.map(lieuxdits, (lieudit) => {
    const commune = findCommuneById(communes, lieudit.communeId);
    return {
      Département: findDepartementById(departements, commune.departementId),
      "Code commune": commune.code,
      "Nom commune": commune.nom,
      "Lieu-dit": lieudit.nom,
      Altitude: lieudit.altitude,
      Longitude: lieudit.coordinates.longitude,
      Latitude: lieudit.coordinates.latitude
    };
  });

  return writeToExcel(objectsToExport, [], "Lieux-dits");
};

export const exportClasses = async (): Promise<unknown> => {
  const classes: Classe[] = await getClasses();

  const objectsToExport = _.map(classes, (object) => {
    return { Classe: object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Classes");
};

export const exportEspeces = async (): Promise<unknown> => {
  const especes: Espece[] = await getEspeces();
  const classes: Classe[] = await getClasses();

  const objectsToExport = _.map(especes, (espece) => {
    return {
      Classe: findClasseById(classes, espece.id),
      Code: espece.code,
      "Nom français": espece.nomFrancais,
      "Nom latin": espece.nomLatin
    };
  });

  return writeToExcel(objectsToExport, [], "Espèces");
};

export const exportAges = async (): Promise<unknown> => {
  const agesDb: Age[] = await getAges();

  const agesToExport = _.map(agesDb, (ageDb) => {
    return { Âge: ageDb.libelle };
  });

  return writeToExcel(agesToExport, [], "Âges");
};

export const exportSexes = async (): Promise<unknown> => {
  const sexes: Sexe[] = await getSexes();

  const objectsToExport = _.map(sexes, (object) => {
    return { Sexe: object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Sexes");
};

export const exportEstimationsNombre = async (): Promise<unknown> => {
  const estimations: EstimationNombre[] = await getEstimationsNombre();

  const objectsToExport = _.map(estimations, (object) => {
    return { "Estimation du nombre": object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Estimations du nombre");
};

export const exportEstimationsDistance = async (): Promise<unknown> => {
  const estimations: EstimationDistance[] = await getEstimationsDistance();

  const objectsToExport = _.map(estimations, (object) => {
    return { "Estimation de la distance": object.libelle };
  });

  return writeToExcel(objectsToExport, [], "Estimations de la distance");
};

export const exportComportements = async (): Promise<unknown> => {
  const comportementsDb: Comportement[] = await getComportements();

  const comportementsToExport = _.map(comportementsDb, (object) => {
    return { Code: object.code, Libellé: object.libelle };
  });

  return writeToExcel(comportementsToExport, [], "Comportements");
};

export const exportMilieux = async (): Promise<unknown> => {
  const milieuxDb: Milieu[] = await getMilieux();

  const milieuxToExport = _.map(milieuxDb, (object) => {
    return { Code: object.code, Libellé: object.libelle };
  });

  return writeToExcel(milieuxToExport, [], "Milieux");
};

export const getEspeceDetailsByAge = (
  httpParameters: HttpParameters
): Promise<{ name: string; value: number }[]> => {
  const especeId: number = +httpParameters.queryParameters.id;
  return countSpecimensByAgeForEspeceId(especeId);
};

export const getEspeceDetailsBySexe = (
  httpParameters: HttpParameters
): Promise<{ name: string; value: number }[]> => {
  const especeId: number = +httpParameters.queryParameters.id;
  return countSpecimensBySexeForEspeceId(especeId);
};
