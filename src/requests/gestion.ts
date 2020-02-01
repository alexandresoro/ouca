import { Age } from "basenaturaliste-model/age.object";
import { Classe } from "basenaturaliste-model/classe.object";
import { Commune } from "basenaturaliste-model/commune.object";
import { Comportement } from "basenaturaliste-model/comportement.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { EntiteSimple } from "basenaturaliste-model/entite-simple.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { EstimationDistance } from "basenaturaliste-model/estimation-distance.object";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { Meteo } from "basenaturaliste-model/meteo.object";
import { Milieu } from "basenaturaliste-model/milieu.object";
import { Observateur } from "basenaturaliste-model/observateur.object";
import { Sexe } from "basenaturaliste-model/sexe.object";
import { PostResponse } from "basenaturaliste-model/post-response.object";
import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindNumberOfDonneesByAgeId } from "../sql/sql-queries-age";
import {
  getQueryToFindNumberOfDonneesByClasseId,
  getQueryToFindNumberOfEspecesByClasseId
} from "../sql/sql-queries-classe";
import { getQueryToFindNumberOfDonneesByComportementId } from "../sql/sql-queries-comportement";
import {
  getQueryToFindNumberOfCommunesByDepartementId,
  getQueryToFindNumberOfDonneesByDepartementId,
  getQueryToFindNumberOfLieuxditsByDepartementId
} from "../sql/sql-queries-departement";
import { getQueryToFindNumberOfDonneesByEspeceId } from "../sql/sql-queries-espece";
import { getQueryToFindNumberOfDonneesByEstimationDistanceId } from "../sql/sql-queries-estimation-distance";
import { getQueryToFindNumberOfDonneesByEstimationNombreId } from "../sql/sql-queries-estimation-nombre";
import { getQueryToFindNumberOfDonneesByLieuditId } from "../sql/sql-queries-lieudit";
import { getQueryToFindNumberOfDonneesByMeteoId } from "../sql/sql-queries-meteo";
import { getQueryToFindNumberOfDonneesByMilieuId } from "../sql/sql-queries-milieu";
import { getQueryToFindNumberOfDonneesByObservateurId } from "../sql/sql-queries-observateur";
import { getQueryToFindNumberOfDonneesBySexeId } from "../sql/sql-queries-sexe";
import {
  DB_SAVE_MAPPING,
  getDeleteEntityByIdQuery,
  getFindAllQuery,
  getSaveEntityQuery
} from "../sql/sql-queries-utils";
import {
  COLUMN_CODE,
  COLUMN_LIBELLE,
  COLUMN_NOM,
  ORDER_ASC,
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
import {
  mapEspeces,
  mapEstimationsNombre,
  buildLieuxditsFromLieuxditsDb,
  buildCommunesFromCommunesDb
} from "../utils/mapping-utils";
import { buildPostResponseFromSqlResponse } from "../utils/post-response-utils";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import { findAllCommunes } from "../sql-api/sql-api-commune";
import { getNbByEntityId } from "../utils/utils";

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
  const sqlResponse: SqlSaveResponse = await SqlConnection.query(
    getDeleteEntityByIdQuery(entityName, +httpParameters.queryParameters.id)
  );
  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getObservateurs = async (): Promise<Observateur[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_OBSERVATEUR, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByObservateurId()
  );
  const observateurs: Observateur[] = results[0];
  const nbDonneesByObservateur: NumberOfObjectsById[] = results[1];
  _.forEach(observateurs, (observateur: Observateur) => {
    observateur.nbDonnees = getNbByEntityId(
      observateur,
      nbDonneesByObservateur
    );
  });
  return observateurs;
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
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_DEPARTEMENT, COLUMN_CODE, ORDER_ASC) +
      getQueryToFindNumberOfCommunesByDepartementId() +
      getQueryToFindNumberOfLieuxditsByDepartementId() +
      getQueryToFindNumberOfDonneesByDepartementId()
  );

  const departements: Departement[] = results[0];
  const nbCommunesByDepartement: NumberOfObjectsById[] = results[1];
  const nbLieuxditsByDepartement: NumberOfObjectsById[] = results[2];
  const nbDonneesByDepartement: NumberOfObjectsById[] = results[3];
  _.forEach(departements, (departement: Departement) => {
    departement.nbCommunes = getNbByEntityId(
      departement,
      nbCommunesByDepartement
    );
    departement.nbLieuxdits = getNbByEntityId(
      departement,
      nbLieuxditsByDepartement
    );
    departement.nbDonnees = getNbByEntityId(
      departement,
      nbDonneesByDepartement
    );
  });
  return departements;
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
  const [
    lieuxditsDb,
    communesDb,
    departements,
    nbDonneesByLieudit
  ] = await Promise.all(
    _.flatten([
      SqlConnection.query(
        getFindAllQuery(TABLE_LIEUDIT, COLUMN_NOM, ORDER_ASC)
      ),
      SqlConnection.query(getFindAllQuery(TABLE_COMMUNE)),
      SqlConnection.query(getFindAllQuery(TABLE_DEPARTEMENT)),
      SqlConnection.query(getQueryToFindNumberOfDonneesByLieuditId())
    ])
  );

  const lieuxdits: Lieudit[] = buildLieuxditsFromLieuxditsDb(lieuxditsDb);
  const communes: Commune[] = buildCommunesFromCommunesDb(communesDb);

  _.forEach(lieuxdits, (lieudit: Lieudit) => {
    lieudit.commune = _.find(communes, (commune: Commune) => {
      return commune.id === lieudit.communeId;
    });
    lieudit.commune.departement = _.find(
      departements,
      (departement: Departement) => {
        return lieudit.commune.departementId === departement.id;
      }
    );
    lieudit.communeId = null;

    lieudit.nbDonnees = getNbByEntityId(lieudit, nbDonneesByLieudit);
  });

  return lieuxdits;
};

export const saveLieudit = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const lieuditToSave: Lieudit = httpParameters.postData;
  if (
    !lieuditToSave.communeId &&
    !!lieuditToSave.commune &&
    !!lieuditToSave.commune.id
  ) {
    lieuditToSave.communeId = lieuditToSave.commune.id;
  }
  // TO DO
  lieuditToSave["longitude"] = lieuditToSave.coordinatesL2E.longitude;
  lieuditToSave["latitude"] = lieuditToSave.coordinatesL2E.latitude;
  return saveEntity(lieuditToSave, TABLE_LIEUDIT, DB_SAVE_MAPPING.lieudit);
};

export const deleteLieudit = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_LIEUDIT);
};

export const getMeteos = async (): Promise<Meteo[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_METEO, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByMeteoId()
  );

  const meteos: Meteo[] = results[0];
  const nbDonneesByMeteo: NumberOfObjectsById[] = results[1];
  _.forEach(meteos, (meteo: Meteo) => {
    meteo.nbDonnees = getNbByEntityId(meteo, nbDonneesByMeteo);
  });

  return meteos;
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
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_CLASSE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfEspecesByClasseId() +
      getQueryToFindNumberOfDonneesByClasseId()
  );

  const classes: Classe[] = results[0];
  const nbEspecesByClasse: NumberOfObjectsById[] = results[1];
  const nbDonneesByClasse: NumberOfObjectsById[] = results[2];
  _.forEach(classes, (classe: Classe) => {
    classe.nbEspeces = getNbByEntityId(classe, nbEspecesByClasse);
    classe.nbDonnees = getNbByEntityId(classe, nbDonneesByClasse);
  });

  return classes;
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
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_ESPECE, COLUMN_CODE, ORDER_ASC) +
      getFindAllQuery(TABLE_CLASSE) +
      getQueryToFindNumberOfDonneesByEspeceId()
  );
  const especes: Espece[] = mapEspeces(results[0]);

  const classes: Classe[] = results[1];
  const nbDonneesByEspece: NumberOfObjectsById[] = results[2];
  _.forEach(especes, (espece: Espece) => {
    espece.classe = _.find(classes, (classe: Classe) => {
      return classe.id === espece.classeId;
    });
    espece.classeId = null;
    espece.nbDonnees = getNbByEntityId(espece, nbDonneesByEspece);
  });

  return especes;
};

export const saveEspece = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const especeToSave: Espece = httpParameters.postData;
  if (
    !especeToSave.classeId &&
    !!especeToSave.classe &&
    !!especeToSave.classe.id
  ) {
    especeToSave.classeId = especeToSave.classe.id;
  }
  return saveEntity(especeToSave, TABLE_ESPECE, DB_SAVE_MAPPING.espece);
};

export const deleteEspece = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  return deleteEntity(httpParameters, TABLE_ESPECE);
};

export const getSexes = async (): Promise<Sexe[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesBySexeId()
  );

  const sexes: Sexe[] = results[0];
  const nbDonneesBySexe: NumberOfObjectsById[] = results[1];
  _.forEach(sexes, (sexe: Sexe) => {
    sexe.nbDonnees = getNbByEntityId(sexe, nbDonneesBySexe);
  });

  return sexes;
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
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByAgeId()
  );

  const ages: Age[] = results[0];
  const nbDonneesByAge: NumberOfObjectsById[] = results[1];
  _.forEach(ages, (age: Age) => {
    age.nbDonnees = getNbByEntityId(age, nbDonneesByAge);
  });

  return ages;
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
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_ESTIMATION_NOMBRE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByEstimationNombreId()
  );

  const estimations: EstimationNombre[] = mapEstimationsNombre(results[0]);
  const nbDonneesByEstimation: NumberOfObjectsById[] = results[1];
  _.forEach(estimations, (estimation: EstimationNombre) => {
    estimation.nbDonnees = getNbByEntityId(estimation, nbDonneesByEstimation);
  });

  return estimations;
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

export const getEstimationsDistance = async (): Promise<EstimationDistance[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_ESTIMATION_DISTANCE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByEstimationDistanceId()
  );

  const estimations: EstimationDistance[] = results[0];
  const nbDonneesByEstimation: NumberOfObjectsById[] = results[1];
  _.forEach(estimations, (estimation: EstimationDistance) => {
    estimation.nbDonnees = getNbByEntityId(estimation, nbDonneesByEstimation);
  });

  return estimations;
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
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_COMPORTEMENT, COLUMN_CODE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByComportementId()
  );

  const comportements: Comportement[] = results[0];
  const nbDonneesByComportement: NumberOfObjectsById[] = results[1];
  _.forEach(comportements, (comportement: Comportement) => {
    comportement.nbDonnees = getNbByEntityId(
      comportement,
      nbDonneesByComportement
    );
  });

  return comportements;
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
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_MILIEU, COLUMN_CODE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByMilieuId()
  );

  const milieux: Milieu[] = results[0];
  const nbDonneesByMilieu: NumberOfObjectsById[] = results[1];
  _.forEach(milieux, (milieu: Milieu) => {
    milieu.nbDonnees = getNbByEntityId(milieu, nbDonneesByMilieu);
  });

  return milieux;
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

  const objectsToExport = _.map(communesDb, (object) => {
    return {
      Departement: object.departement.code,
      Code: object.code,
      Nom: object.nom
    };
  });

  return writeToExcel(
    objectsToExport,
    ["Departement", "Code", "Nom"],
    "communes"
  );
};

export const exportLieuxdits = async (): Promise<any> => {
  const lieuxditsDb: Lieudit[] = await getLieuxdits();

  const objectsToExport = _.map(lieuxditsDb, (object) => {
    return {
      Département: object.commune.departement.code,
      "Code commune": object.commune.code,
      "Nom commune": object.commune.nom,
      "Lieu-dit": object.nom,
      Altitude: object.altitude,
      "Longitude (Lambert II étendu)": object.coordinatesL2E.longitude,
      "Latitude (Lambert II étendu)": object.coordinatesL2E.latitude
    };
  });

  return writeToExcel(
    objectsToExport,
    [
      "Département",
      "Code commune",
      "Nom commune",
      "Lieu-dit",
      "Altitude",
      "Longitude (Lambert II étendu)",
      "Latitude (Lambert II étendu)"
    ],
    "lieuxdits"
  );
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

  const objectsToExport = _.map(especes, (object) => {
    return {
      Classe: object.classe.libelle,
      Code: object.code,
      NomFrancais: object.nomFrancais,
      NomLatin: object.nomLatin
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
