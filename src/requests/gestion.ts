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
import { HttpParameters } from "../http/httpParameters.js";
import agesMock from "../mocks/gestion-base-pages/ages.json";
import classesMock from "../mocks/gestion-base-pages/classes.json";
import communesMock from "../mocks/gestion-base-pages/communes.json";
import comportementsMock from "../mocks/gestion-base-pages/comportements.json";
import departementsMock from "../mocks/gestion-base-pages/departements.json";
import especesMock from "../mocks/gestion-base-pages/especes.json";
import estimationsDistanceMock from "../mocks/gestion-base-pages/estimations-distance.json";
import estimationsNombreMock from "../mocks/gestion-base-pages/estimations-nombre.json";
import lieuxDitsMock from "../mocks/gestion-base-pages/lieuxdits.json";
import milieuxMock from "../mocks/gestion-base-pages/milieux.json";
import observateursMock from "../mocks/gestion-base-pages/observateurs.json";
import sexesMock from "../mocks/gestion-base-pages/sexes.json";
import { SqlConnection } from "../sql/sql-connection.js";
import {
  DB_SAVE_MAPPING,
  getDeleteEntityByIdQuery,
  getFindAllQuery,
  getFindNumberOfCommunesByDepartementIdQuery,
  getFindNumberOfDonneesByAgeIdQuery,
  getFindNumberOfDonneesByClasseIdQuery,
  getFindNumberOfDonneesByCommuneIdQuery,
  getFindNumberOfDonneesByComportementIdQuery,
  getFindNumberOfDonneesByDepartementIdQuery,
  getFindNumberOfDonneesByEspeceIdQuery,
  getFindNumberOfDonneesByEstimationDistanceIdQuery,
  getFindNumberOfDonneesByEstimationNombreIdQuery,
  getFindNumberOfDonneesByLieuditIdQuery,
  getFindNumberOfDonneesByMeteoIdQuery,
  getFindNumberOfDonneesByMilieuIdQuery,
  getFindNumberOfDonneesByObservateurIdQuery,
  getFindNumberOfDonneesBySexeIdQuery,
  getFindNumberOfEspecesByClasseIdQuery,
  getFindNumberOfLieuxditsByCommuneIdQuery,
  getFindNumberOfLieuxditsByDepartementIdQuery,
  getSaveEntityQuery
} from "../sql/sql-queries-utils.js";
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
} from "../utils/constants.js";
import {
  mapCommunes,
  mapEspeces,
  mapEstimationsNombre,
  mapLieuxdits
} from "../utils/mapping-utils.js";

export const getObservateurs = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Observateur[]> => {
  if (isMockDatabaseMode) {
    return observateursMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_OBSERVATEUR, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfDonneesByObservateurIdQuery()
    );
    const observateurs: Observateur[] = results[0];
    const nbDonneesByObservateur: any[] = results[1];
    _.forEach(observateurs, (observateur: Observateur) => {
      getNbByEntityId(observateur, nbDonneesByObservateur, NB_DONNEES);
    });
    return observateurs;
  }
};

export const saveObservateur = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_OBSERVATEUR,
    DB_SAVE_MAPPING.observateur
  );
};

export const deleteObservateur = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_OBSERVATEUR);
};

export const getDepartements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Departement[]> => {
  if (isMockDatabaseMode) {
    return departementsMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_DEPARTEMENT, COLUMN_CODE, ORDER_ASC) +
        getFindNumberOfCommunesByDepartementIdQuery() +
        getFindNumberOfLieuxditsByDepartementIdQuery() +
        getFindNumberOfDonneesByDepartementIdQuery()
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
  }
};

export const saveDepartement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_DEPARTEMENT,
    DB_SAVE_MAPPING.departement
  );
};

export const deleteDepartement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
) => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_DEPARTEMENT);
};

export const getCommunes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Commune[]> => {
  if (isMockDatabaseMode) {
    return communesMock as any[];
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_COMMUNE, COLUMN_NOM, ORDER_ASC) +
        getFindAllQuery(TABLE_DEPARTEMENT) +
        getFindNumberOfLieuxditsByCommuneIdQuery() +
        getFindNumberOfDonneesByCommuneIdQuery()
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
  }
};

export const saveCommune = async (
  isMockDatabaseMode: boolean,
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
  return saveEntity(
    isMockDatabaseMode,
    communeToSave,
    TABLE_COMMUNE,
    DB_SAVE_MAPPING.commune
  );
};

export const deleteCommune = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_COMMUNE);
};

export const getLieuxdits = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Lieudit[]> => {
  if (isMockDatabaseMode) {
    return lieuxDitsMock as Lieudit[];
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_LIEUDIT, COLUMN_NOM, ORDER_ASC) +
        getFindAllQuery(TABLE_COMMUNE) +
        getFindAllQuery(TABLE_DEPARTEMENT) +
        getFindNumberOfDonneesByLieuditIdQuery()
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
  }
};

export const saveLieudit = async (
  isMockDatabaseMode: boolean,
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
  return saveEntity(
    isMockDatabaseMode,
    lieuditToSave,
    TABLE_LIEUDIT,
    DB_SAVE_MAPPING.lieudit
  );
};

export const deleteLieudit = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_LIEUDIT);
};

export const getMeteos = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Meteo[]> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_METEO, COLUMN_LIBELLE, ORDER_ASC) +
      getFindNumberOfDonneesByMeteoIdQuery()
  );

  const meteos: Meteo[] = results[0];
  const nbDonneesByMeteo: any[] = results[1];
  _.forEach(meteos, (meteo: Meteo) => {
    getNbByEntityId(meteo, nbDonneesByMeteo, NB_DONNEES);
  });

  return meteos;
};

export const saveMeteo = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_METEO,
    DB_SAVE_MAPPING.meteo
  );
};

export const deleteMeteo = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_METEO);
};

export const getClasses = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Classe[]> => {
  if (isMockDatabaseMode) {
    return Promise.resolve(classesMock);
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_CLASSE, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfEspecesByClasseIdQuery() +
        getFindNumberOfDonneesByClasseIdQuery()
    );

    const classes: Classe[] = results[0];
    const nbEspecesByClasse: any[] = results[1];
    const nbDonneesByClasse: any[] = results[2];
    _.forEach(classes, (classe: Classe) => {
      getNbByEntityId(classe, nbEspecesByClasse, NB_ESPECES);
      getNbByEntityId(classe, nbDonneesByClasse, NB_DONNEES);
    });

    return classes;
  }
};

export const saveClasse = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_CLASSE,
    DB_SAVE_MAPPING.classe
  );
};

export const deleteClasse = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_CLASSE);
};

export const getEspeces = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Espece[]> => {
  if (isMockDatabaseMode) {
    return especesMock as Espece[];
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_ESPECE, COLUMN_CODE, ORDER_ASC) +
        getFindAllQuery(TABLE_CLASSE) +
        getFindNumberOfDonneesByEspeceIdQuery()
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
  }
};

export const saveEspece = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    return { affectedRows: 1, insertId: 132, warningStatus: 0 };
  } else {
    const especeToSave: Espece = httpParameters.postData;
    if (
      !especeToSave.classeId &&
      !!especeToSave.classe &&
      !!especeToSave.classe.id
    ) {
      especeToSave.classeId = especeToSave.classe.id;
    }
    return saveEntity(
      isMockDatabaseMode,
      especeToSave,
      TABLE_ESPECE,
      DB_SAVE_MAPPING.espece
    );
  }
};

export const deleteEspece = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_ESPECE);
};

export const getSexes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Sexe[]> => {
  if (isMockDatabaseMode) {
    return sexesMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfDonneesBySexeIdQuery()
    );

    const sexes: Sexe[] = results[0];
    const nbDonneesBySexe: any[] = results[1];
    _.forEach(sexes, (sexe: Sexe) => {
      getNbByEntityId(sexe, nbDonneesBySexe, NB_DONNEES);
    });

    return sexes;
  }
};

export const saveSexe = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_SEXE,
    DB_SAVE_MAPPING.sexe
  );
};

export const deleteSexe = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_SEXE);
};

export const getAges = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Age[]> => {
  if (isMockDatabaseMode) {
    return agesMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfDonneesByAgeIdQuery()
    );

    const ages: Age[] = results[0];
    const nbDonneesByAge: any[] = results[1];
    _.forEach(ages, (age: Age) => {
      getNbByEntityId(age, nbDonneesByAge, NB_DONNEES);
    });

    return ages;
  }
};

export const saveAge = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_AGE,
    DB_SAVE_MAPPING.age
  );
};

export const deleteAge = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_AGE);
};

export const getEstimationsNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<EstimationNombre[]> => {
  if (isMockDatabaseMode) {
    return estimationsNombreMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_ESTIMATION_NOMBRE, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfDonneesByEstimationNombreIdQuery()
    );

    const estimations: EstimationNombre[] = mapEstimationsNombre(results[0]);
    const nbDonneesByEstimation: any[] = results[1];
    _.forEach(estimations, (estimation: EstimationNombre) => {
      getNbByEntityId(estimation, nbDonneesByEstimation, NB_DONNEES);
    });

    return estimations;
  }
};

export const saveEstimationNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_ESTIMATION_NOMBRE,
    DB_SAVE_MAPPING.estimationNombre
  );
};

export const deleteEstimationNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(
    isMockDatabaseMode,
    httpParameters,
    TABLE_ESTIMATION_NOMBRE
  );
};

export const getEstimationsDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<EstimationDistance[]> => {
  if (isMockDatabaseMode) {
    return estimationsDistanceMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_ESTIMATION_DISTANCE, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfDonneesByEstimationDistanceIdQuery()
    );

    const estimations: EstimationDistance[] = results[0];
    const nbDonneesByEstimation: any[] = results[1];
    _.forEach(estimations, (estimation: EstimationDistance) => {
      getNbByEntityId(estimation, nbDonneesByEstimation, NB_DONNEES);
    });

    return estimations;
  }
};

export const saveEstimationDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_ESTIMATION_DISTANCE,
    DB_SAVE_MAPPING.estimationDistance
  );
};

export const deleteEstimationDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(
    isMockDatabaseMode,
    httpParameters,
    TABLE_ESTIMATION_DISTANCE
  );
};

export const getComportements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Comportement[]> => {
  if (isMockDatabaseMode) {
    return comportementsMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_COMPORTEMENT, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfDonneesByComportementIdQuery()
    );

    const comportements: Comportement[] = results[0];
    const nbDonneesByComportement: any[] = results[1];
    _.forEach(comportements, (comportement: Comportement) => {
      getNbByEntityId(comportement, nbDonneesByComportement, NB_DONNEES);
    });

    return comportements;
  }
};

export const saveComportement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_COMPORTEMENT,
    DB_SAVE_MAPPING.comportement
  );
};

export const deleteComportement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_COMPORTEMENT);
};

export const getMilieux = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Milieu[]> => {
  if (isMockDatabaseMode) {
    return milieuxMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_MILIEU, COLUMN_LIBELLE, ORDER_ASC) +
        getFindNumberOfDonneesByMilieuIdQuery()
    );

    const milieux: Milieu[] = results[0];
    const nbDonneesByMilieu: any[] = results[1];
    _.forEach(milieux, (milieu: Milieu) => {
      getNbByEntityId(milieu, nbDonneesByMilieu, NB_DONNEES);
    });

    return milieux;
  }
};

export const saveMilieu = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return saveEntity(
    isMockDatabaseMode,
    httpParameters.postData,
    TABLE_MILIEU,
    DB_SAVE_MAPPING.milieu
  );
};

export const deleteMilieu = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  return deleteEntity(isMockDatabaseMode, httpParameters, TABLE_MILIEU);
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
  isMockDatabaseMode: boolean,
  entityToSave: any,
  tableName: string,
  mapping: any
): Promise<any> => {
  if (isMockDatabaseMode) {
    return { affectedRows: 1, insertId: 1, warningStatus: 0 };
  } else {
    const saveResult = await SqlConnection.query(
      getSaveEntityQuery(tableName, entityToSave, mapping)
    );
    return saveResult;
  }
};

const deleteEntity = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  entityName: string
): Promise<any> => {
  if (isMockDatabaseMode) {
    return { affectedRows: 1, insertId: 0, warningStatus: 0 };
  } else {
    const deleteResult = await SqlConnection.query(
      getDeleteEntityByIdQuery(entityName, +httpParameters.queryParameters.id)
    );
    return deleteResult;
  }
};
