import * as _ from "lodash";
import { Age } from "ouca-common/age.object";
import { Classe } from "ouca-common/classe.object";
import { Commune } from "ouca-common/commune.model";
import { Comportement } from "ouca-common/comportement.object";
import { Departement } from "ouca-common/departement.object";
import { EntiteSimple } from "ouca-common/entite-simple.object";
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
import { findAllAges } from "../sql-api/sql-api-age";
import { findAllClasses } from "../sql-api/sql-api-classe";
import { deleteEntityById } from "../sql-api/sql-api-common";
import { findAllCommunes } from "../sql-api/sql-api-commune";
import { findAllComportements } from "../sql-api/sql-api-comportement";
import { findAllDepartements } from "../sql-api/sql-api-departement";
import { findAllEspeces } from "../sql-api/sql-api-espece";
import { findAllEstimationsDistance } from "../sql-api/sql-api-estimation-distance";
import { findAllEstimationsNombre } from "../sql-api/sql-api-estimation-nombre";
import { findAllLieuxDits, persistLieudit } from "../sql-api/sql-api-lieudit";
import { findAllMeteos } from "../sql-api/sql-api-meteo";
import { findAllMilieux } from "../sql-api/sql-api-milieu";
import { findAllObservateurs } from "../sql-api/sql-api-observateur";
import { findAllSexes } from "../sql-api/sql-api-sexe";
import { SqlConnection } from "../sql-api/sql-connection";
import { DB_SAVE_MAPPING, getSaveEntityQuery } from "../sql/sql-queries-utils";
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
  TABLE_OBSERVATEUR,
  TABLE_SEXE
} from "../utils/constants";
import { writeToExcel } from "../utils/export-excel-utils";
import { buildPostResponseFromSqlResponse } from "../utils/post-response-utils";

const saveEntity = async (
  entityToSave: EntiteSimple,
  tableName: string,
  mapping: { [column: string]: string }
): Promise<PostResponse> => {
  const sqlResponse: SqlSaveResponse = await SqlConnection.query(
    getSaveEntityQuery(tableName, entityToSave, mapping)
  );
  return buildPostResponseFromSqlResponse(sqlResponse);
};

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
  return saveEntity(
    httpParameters.postData,
    TABLE_OBSERVATEUR,
    DB_SAVE_MAPPING.observateur
  );
};

export const deleteObservateur = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_OBSERVATEUR);
};

export const getDepartements = async (): Promise<Departement[]> => {
  return await findAllDepartements();
};

export const saveDepartement = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_DEPARTEMENT,
    DB_SAVE_MAPPING.departement
  );
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
  const communeToSave = httpParameters.postData;
  if (
    !communeToSave.departementId &&
    !!communeToSave.departement &&
    !!communeToSave.departement.id
  ) {
    communeToSave.departementId = communeToSave.departement.id;
  }
  return saveEntity(communeToSave, TABLE_COMMUNE, DB_SAVE_MAPPING.commune);
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
  const sqlResponse = await persistLieudit(lieuditToSave);
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
  return saveEntity(
    httpParameters.postData,
    TABLE_METEO,
    DB_SAVE_MAPPING.meteo
  );
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
  return saveEntity(
    httpParameters.postData,
    TABLE_CLASSE,
    DB_SAVE_MAPPING.classe
  );
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
  const especeToSave: Espece = httpParameters.postData;
  return saveEntity(especeToSave, TABLE_ESPECE, DB_SAVE_MAPPING.espece);
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
  return saveEntity(httpParameters.postData, TABLE_SEXE, DB_SAVE_MAPPING.sexe);
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
  return saveEntity(httpParameters.postData, TABLE_AGE, DB_SAVE_MAPPING.age);
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
  return saveEntity(
    httpParameters.postData,
    TABLE_ESTIMATION_NOMBRE,
    DB_SAVE_MAPPING.estimationNombre
  );
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
  return saveEntity(
    httpParameters.postData,
    TABLE_ESTIMATION_DISTANCE,
    DB_SAVE_MAPPING.estimationDistance
  );
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
  return saveEntity(
    httpParameters.postData,
    TABLE_COMPORTEMENT,
    DB_SAVE_MAPPING.comportement
  );
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
  return saveEntity(
    httpParameters.postData,
    TABLE_MILIEU,
    DB_SAVE_MAPPING.milieu
  );
};

export const deleteMilieu = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_MILIEU);
};

export const exportObservateurs = async (): Promise<any> => {
  const observateurs: Observateur[] = await getObservateurs();

  const objectsToExport = _.map(observateurs, (object) => {
    return {
      Observateur: object.libelle
    };
  });

  return writeToExcel(objectsToExport, ["Observateur"], "observateurs");
};

export const exportMeteos = async (): Promise<any> => {
  const meteos: Meteo[] = await getMeteos();

  const objectsToExport = _.map(meteos, (object) => {
    return {
      Meteo: object.libelle
    };
  });

  return writeToExcel(objectsToExport, ["Meteo"], "meteos");
};

export const exportDepartements = async (): Promise<any> => {
  const departementsDb: Departement[] = await getDepartements();

  const objectsToExport = _.map(departementsDb, (object) => {
    return {
      Departement: object.code
    };
  });

  return writeToExcel(objectsToExport, ["Departement"], "departements");
};

export const exportCommunes = async (): Promise<any> => {
  const communesDb: Commune[] = await getCommunes();
  const departements: Departement[] = await getDepartements();

  const objectsToExport = _.map(communesDb, (communeDb) => {
    return {
      Departement: findDepartementById(departements, communeDb.departementId),
      Code: communeDb.code,
      Nom: communeDb.nom
    };
  });

  return writeToExcel(
    objectsToExport,
    ["Departement", "Code", "Nom"],
    "communes"
  );
};

export const exportLieuxdits = async (): Promise<any> => {
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

export const exportClasses = async (): Promise<any> => {
  const classes: Classe[] = await getClasses();

  const objectsToExport = _.map(classes, (object) => {
    return { Classe: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Classe"], "classes");
};

export const exportEspeces = async (): Promise<any> => {
  const especes: Espece[] = await getEspeces();
  const classes: Classe[] = await getClasses();

  const objectsToExport = _.map(especes, (espece) => {
    return {
      Classe: findClasseById(classes, espece.id),
      Code: espece.code,
      NomFrancais: espece.nomFrancais,
      NomLatin: espece.nomLatin
    };
  });

  return writeToExcel(
    objectsToExport,
    ["Classe", "Code", "NomFrancais", "NomLatin"],
    "especes"
  );
};

export const exportAges = async (): Promise<any> => {
  const agesDb: Age[] = await getAges();

  const agesToExport = _.map(agesDb, (ageDb) => {
    return { Age: ageDb.libelle };
  });

  return writeToExcel(agesToExport, ["Age"], "ages");
};

export const exportSexes = async (): Promise<any> => {
  const sexes: Sexe[] = await getSexes();

  const objectsToExport = _.map(sexes, (object) => {
    return { Sexe: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Sexe"], "sexes");
};

export const exportEstimationsNombre = async (): Promise<any> => {
  const estimations: EstimationNombre[] = await getEstimationsNombre();

  const objectsToExport = _.map(estimations, (object) => {
    return { Estimation: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Estimation"], "estimations-nombre");
};

export const exportEstimationsDistance = async (): Promise<any> => {
  const estimations: EstimationDistance[] = await getEstimationsDistance();

  const objectsToExport = _.map(estimations, (object) => {
    return { Estimation: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Estimation"], "estimations-distance");
};

export const exportComportements = async (): Promise<any> => {
  const comportementsDb: Comportement[] = await getComportements();

  const comportementsToExport = _.map(comportementsDb, (object) => {
    return { Code: object.code, Libelle: object.libelle };
  });

  return writeToExcel(
    comportementsToExport,
    ["Code", "Libelle"],
    "comportements"
  );
};

export const exportMilieux = async (): Promise<any> => {
  const milieuxDb: Milieu[] = await getMilieux();

  const milieuxToExport = _.map(milieuxDb, (object) => {
    return { Code: object.code, Libelle: object.libelle };
  });

  return writeToExcel(milieuxToExport, ["Code", "Libelle"], "milieux");
};
