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
import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindNumberOfDonneesByAgeId } from "../sql/sql-queries-age";
import {
  getQueryToFindNumberOfDonneesByClasseId,
  getQueryToFindNumberOfEspecesByClasseId
} from "../sql/sql-queries-classe";
import {
  getQueryToFindNumberOfDonneesByCommuneId,
  getQueryToFindNumberOfLieuxditsByCommuneId
} from "../sql/sql-queries-commune";
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
  NB_COMMUNES,
  NB_DONNEES,
  NB_ESPECES,
  NB_LIEUXDITS,
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
  mapCommunes,
  mapEspeces,
  mapEstimationsNombre,
  mapLieuxdits
} from "../utils/mapping-utils";

export const getObservateurs = async (
  httpParameters: HttpParameters
): Promise<Observateur[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_OBSERVATEUR, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByObservateurId()
  );
  const observateurs: Observateur[] = results[0];
  const nbDonneesByObservateur: any[] = results[1];
  _.forEach(observateurs, (observateur: Observateur) => {
    getNbByEntityId(observateur, nbDonneesByObservateur, NB_DONNEES);
  });
  return observateurs;
};

export const saveObservateur = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_OBSERVATEUR,
    DB_SAVE_MAPPING.observateur
  );
};

export const deleteObservateur = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_OBSERVATEUR);
};

export const getDepartements = async (
  httpParameters: HttpParameters
): Promise<Departement[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_DEPARTEMENT, COLUMN_CODE, ORDER_ASC) +
      getQueryToFindNumberOfCommunesByDepartementId() +
      getQueryToFindNumberOfLieuxditsByDepartementId() +
      getQueryToFindNumberOfDonneesByDepartementId()
  );

  const departements: Departement[] = results[0];
  const nbCommunesByDepartement: any[] = results[1];
  const nbLieuxditsByDepartement: any[] = results[2];
  const nbDonneesByDepartement: any[] = results[3];
  _.forEach(departements, (departement: Departement) => {
    getNbByEntityId(departement, nbCommunesByDepartement, NB_COMMUNES);
    getNbByEntityId(departement, nbLieuxditsByDepartement, NB_LIEUXDITS);
    getNbByEntityId(departement, nbDonneesByDepartement, NB_DONNEES);
  });
  return departements;
};

export const saveDepartement = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_DEPARTEMENT,
    DB_SAVE_MAPPING.departement
  );
};

export const deleteDepartement = async (httpParameters: HttpParameters) => {
  return deleteEntity(httpParameters, TABLE_DEPARTEMENT);
};

export const getCommunes = async (
  httpParameters: HttpParameters
): Promise<Commune[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_COMMUNE, COLUMN_NOM, ORDER_ASC) +
      getFindAllQuery(TABLE_DEPARTEMENT) +
      getQueryToFindNumberOfLieuxditsByCommuneId() +
      getQueryToFindNumberOfDonneesByCommuneId()
  );

  const communes: Commune[] = mapCommunes(results[0]);

  const departements: Departement[] = results[1];
  const nbLieuxditsByCommune: any[] = results[2];
  const nbDonneesByCommune: any[] = results[3];
  _.forEach(communes, (commune: Commune) => {
    commune.departement = _.find(departements, (departement: Departement) => {
      return departement.id === commune.departementId;
    });
    commune.departementId = null;
    getNbByEntityId(commune, nbLieuxditsByCommune, NB_LIEUXDITS);
    getNbByEntityId(commune, nbDonneesByCommune, NB_DONNEES);
  });

  return communes;
};

export const saveCommune = async (
  httpParameters: HttpParameters
): Promise<any> => {
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
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_COMMUNE);
};

export const getLieuxdits = async (
  httpParameters: HttpParameters
): Promise<Lieudit[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_LIEUDIT, COLUMN_NOM, ORDER_ASC) +
      getFindAllQuery(TABLE_COMMUNE) +
      getFindAllQuery(TABLE_DEPARTEMENT) +
      getQueryToFindNumberOfDonneesByLieuditId()
  );
  const lieuxdits: Lieudit[] = mapLieuxdits(results[0]);

  const communes: Commune[] = mapCommunes(results[1]);
  const departements: Departement[] = results[2];
  const nbDonneesByLieudit: any[] = results[3];

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

    getNbByEntityId(lieudit, nbDonneesByLieudit, NB_DONNEES);
  });

  return lieuxdits;
};

export const saveLieudit = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const lieuditToSave = httpParameters.postData;
  if (
    !lieuditToSave.communeId &&
    !!lieuditToSave.commune &&
    !!lieuditToSave.commune.id
  ) {
    lieuditToSave.communeId = lieuditToSave.commune.id;
  }
  return saveEntity(lieuditToSave, TABLE_LIEUDIT, DB_SAVE_MAPPING.lieudit);
};

export const deleteLieudit = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_LIEUDIT);
};

export const getMeteos = async (
  httpParameters: HttpParameters
): Promise<Meteo[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_METEO, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByMeteoId()
  );

  const meteos: Meteo[] = results[0];
  const nbDonneesByMeteo: any[] = results[1];
  _.forEach(meteos, (meteo: Meteo) => {
    getNbByEntityId(meteo, nbDonneesByMeteo, NB_DONNEES);
  });

  return meteos;
};

export const saveMeteo = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_METEO,
    DB_SAVE_MAPPING.meteo
  );
};

export const deleteMeteo = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_METEO);
};

export const getClasses = async (
  httpParameters: HttpParameters
): Promise<Classe[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_CLASSE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfEspecesByClasseId() +
      getQueryToFindNumberOfDonneesByClasseId()
  );

  const classes: Classe[] = results[0];
  const nbEspecesByClasse: any[] = results[1];
  const nbDonneesByClasse: any[] = results[2];
  _.forEach(classes, (classe: Classe) => {
    getNbByEntityId(classe, nbEspecesByClasse, NB_ESPECES);
    getNbByEntityId(classe, nbDonneesByClasse, NB_DONNEES);
  });

  return classes;
};

export const saveClasse = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_CLASSE,
    DB_SAVE_MAPPING.classe
  );
};

export const deleteClasse = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_CLASSE);
};

export const getEspeces = async (
  httpParameters: HttpParameters
): Promise<Espece[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_ESPECE, COLUMN_CODE, ORDER_ASC) +
      getFindAllQuery(TABLE_CLASSE) +
      getQueryToFindNumberOfDonneesByEspeceId()
  );
  const especes: Espece[] = mapEspeces(results[0]);

  const classes: Classe[] = results[1];
  const nbDonneesByEspece: any[] = results[2];
  _.forEach(especes, (espece: Espece) => {
    espece.classe = _.find(classes, (classe: Classe) => {
      return classe.id === espece.classeId;
    });
    espece.classeId = null;
    getNbByEntityId(espece, nbDonneesByEspece, NB_DONNEES);
  });

  return especes;
};

export const saveEspece = async (
  httpParameters: HttpParameters
): Promise<any> => {
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
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_ESPECE);
};

export const getSexes = async (
  httpParameters: HttpParameters
): Promise<Sexe[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesBySexeId()
  );

  const sexes: Sexe[] = results[0];
  const nbDonneesBySexe: any[] = results[1];
  _.forEach(sexes, (sexe: Sexe) => {
    getNbByEntityId(sexe, nbDonneesBySexe, NB_DONNEES);
  });

  return sexes;
};

export const saveSexe = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(httpParameters.postData, TABLE_SEXE, DB_SAVE_MAPPING.sexe);
};

export const deleteSexe = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_SEXE);
};

export const getAges = async (
  httpParameters: HttpParameters
): Promise<Age[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByAgeId()
  );

  const ages: Age[] = results[0];
  const nbDonneesByAge: any[] = results[1];
  _.forEach(ages, (age: Age) => {
    getNbByEntityId(age, nbDonneesByAge, NB_DONNEES);
  });

  return ages;
};

export const saveAge = async (httpParameters: HttpParameters): Promise<any> => {
  return saveEntity(httpParameters.postData, TABLE_AGE, DB_SAVE_MAPPING.age);
};

export const deleteAge = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_AGE);
};

export const getEstimationsNombre = async (
  httpParameters: HttpParameters
): Promise<EstimationNombre[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_ESTIMATION_NOMBRE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByEstimationNombreId()
  );

  const estimations: EstimationNombre[] = mapEstimationsNombre(results[0]);
  const nbDonneesByEstimation: any[] = results[1];
  _.forEach(estimations, (estimation: EstimationNombre) => {
    getNbByEntityId(estimation, nbDonneesByEstimation, NB_DONNEES);
  });

  return estimations;
};

export const saveEstimationNombre = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_ESTIMATION_NOMBRE,
    DB_SAVE_MAPPING.estimationNombre
  );
};

export const deleteEstimationNombre = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_NOMBRE);
};

export const getEstimationsDistance = async (
  httpParameters: HttpParameters
): Promise<EstimationDistance[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_ESTIMATION_DISTANCE, COLUMN_LIBELLE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByEstimationDistanceId()
  );

  const estimations: EstimationDistance[] = results[0];
  const nbDonneesByEstimation: any[] = results[1];
  _.forEach(estimations, (estimation: EstimationDistance) => {
    getNbByEntityId(estimation, nbDonneesByEstimation, NB_DONNEES);
  });

  return estimations;
};

export const saveEstimationDistance = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_ESTIMATION_DISTANCE,
    DB_SAVE_MAPPING.estimationDistance
  );
};

export const deleteEstimationDistance = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_ESTIMATION_DISTANCE);
};

export const getComportements = async (
  httpParameters: HttpParameters
): Promise<Comportement[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_COMPORTEMENT, COLUMN_CODE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByComportementId()
  );

  const comportements: Comportement[] = results[0];
  const nbDonneesByComportement: any[] = results[1];
  _.forEach(comportements, (comportement: Comportement) => {
    getNbByEntityId(comportement, nbDonneesByComportement, NB_DONNEES);
  });

  return comportements;
};

export const saveComportement = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_COMPORTEMENT,
    DB_SAVE_MAPPING.comportement
  );
};

export const deleteComportement = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_COMPORTEMENT);
};

export const getMilieux = async (
  httpParameters: HttpParameters
): Promise<Milieu[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_MILIEU, COLUMN_CODE, ORDER_ASC) +
      getQueryToFindNumberOfDonneesByMilieuId()
  );

  const milieux: Milieu[] = results[0];
  const nbDonneesByMilieu: any[] = results[1];
  _.forEach(milieux, (milieu: Milieu) => {
    getNbByEntityId(milieu, nbDonneesByMilieu, NB_DONNEES);
  });

  return milieux;
};

export const saveMilieu = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    httpParameters.postData,
    TABLE_MILIEU,
    DB_SAVE_MAPPING.milieu
  );
};

export const deleteMilieu = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(httpParameters, TABLE_MILIEU);
};

const getNbByEntityId = (
  object: EntiteSimple,
  nbById: any[],
  fieldName: string
) => {
  const foundValue = _.find(nbById, (element) => {
    return element.id === object.id;
  });
  object[fieldName] = foundValue ? foundValue[fieldName] : 0;
};

const saveEntity = async (
  entityToSave: any,
  tableName: string,
  mapping: any
): Promise<any> => {
  const saveResult = await SqlConnection.query(
    getSaveEntityQuery(tableName, entityToSave, mapping)
  );
  return saveResult;
};

const deleteEntity = async (
  httpParameters: HttpParameters,
  entityName: string
): Promise<any> => {
  const deleteResult = await SqlConnection.query(
    getDeleteEntityByIdQuery(entityName, +httpParameters.queryParameters.id)
  );
  return deleteResult;
};

export const exportObservateurs = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const observateurs: Observateur[] = await getObservateurs(null);

  const objectsToExport = _.map(observateurs, (object) => {
    return {
      Observateur: object.libelle
    };
  });

  return writeToExcel(objectsToExport, ["Observateur"], "observateurs");
};

export const exportMeteos = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const meteos: Meteo[] = await getMeteos(null);

  const objectsToExport = _.map(meteos, (object) => {
    return {
      Meteo: object.libelle
    };
  });

  return writeToExcel(objectsToExport, ["Meteo"], "meteos");
};

export const exportDepartements = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const departementsDb: Departement[] = await getDepartements(null);

  const objectsToExport = _.map(departementsDb, (object) => {
    return {
      Departement: object.code
    };
  });

  return writeToExcel(objectsToExport, ["Departement"], "departements");
};

export const exportCommunes = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const communesDb: Commune[] = await getCommunes(null);

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

export const exportLieuxdits = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const lieuxditsDb: Lieudit[] = await getLieuxdits(null);

  const objectsToExport = _.map(lieuxditsDb, (object) => {
    return {
      Departement: object.commune.departement.code,
      CodeCommune: object.commune.code,
      NomCommune: object.commune.nom,
      Lieudit: object.nom,
      Altitude: object.altitude,
      Longitude: object.longitude,
      Latitude: object.latitude
    };
  });

  return writeToExcel(
    objectsToExport,
    [
      "Departement",
      "CodeCommune",
      "NomCommune",
      "Lieudit",
      "Altitude",
      "Longitude",
      "Latitude"
    ],
    "lieuxdits"
  );
};

export const exportClasses = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const classes: Classe[] = await getClasses(null);

  const objectsToExport = _.map(classes, (object) => {
    return { Classe: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Classe"], "classes");
};

export const exportEspeces = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const especes: Espece[] = await getEspeces(null);

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

export const exportAges = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const agesDb: Age[] = await getAges(null);

  const agesToExport = _.map(agesDb, (ageDb) => {
    return { Age: ageDb.libelle };
  });

  return writeToExcel(agesToExport, ["Age"], "ages");
};

export const exportSexes = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const sexes: Sexe[] = await getSexes(null);

  const objectsToExport = _.map(sexes, (object) => {
    return { Sexe: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Sexe"], "sexes");
};

export const exportEstimationsNombre = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const estimations: EstimationNombre[] = await getEstimationsNombre(null);

  const objectsToExport = _.map(estimations, (object) => {
    return { Estimation: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Estimation"], "estimations-nombre");
};

export const exportEstimationsDistance = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const estimations: EstimationDistance[] = await getEstimationsDistance(null);

  const objectsToExport = _.map(estimations, (object) => {
    return { Estimation: object.libelle };
  });

  return writeToExcel(objectsToExport, ["Estimation"], "estimations-distance");
};

export const exportComportements = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const comportementsDb: Comportement[] = await getComportements(null);

  const comportementsToExport = _.map(comportementsDb, (object) => {
    return { Code: object.code, Libelle: object.libelle };
  });

  return writeToExcel(
    comportementsToExport,
    ["Code", "Libelle"],
    "comportements"
  );
};

export const exportMilieux = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const milieuxDb: Milieu[] = await getMilieux(null);

  const milieuxToExport = _.map(milieuxDb, (object) => {
    return { Code: object.code, Libelle: object.libelle };
  });

  return writeToExcel(milieuxToExport, ["Code", "Libelle"], "milieux");
};
