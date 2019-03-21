import { Age } from "basenaturaliste-model/age.object";
import { Classe } from "basenaturaliste-model/classe.object";
import { Commune } from "basenaturaliste-model/commune.object";
import { Comportement } from "basenaturaliste-model/comportement.object";
import { Departement } from "basenaturaliste-model/departement.object";
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
import meteosMock from "../mocks/gestion-base-pages/meteos.json";
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
  getFindNumberOfDonneesByDepartementIdQuery,
  getFindNumberOfDonneesByDoneeeEntityIdQuery,
  getFindNumberOfDonneesByEstimationNombreIdQuery,
  getFindNumberOfDonneesByLieuditIdQuery,
  getFindNumberOfDonneesByObservateurIdQuery,
  getFindNumberOfDonneesBySexeIdQuery,
  getFindNumberOfEspecesByClasseIdQuery,
  getFindNumberOfLieuxditsByCommuneIdQuery,
  getFindNumberOfLieuxditsByDepartementIdQuery,
  getSaveEntityQuery
} from "../sql/sql-queries-utils.js";

export const getObservateurs = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Observateur[]> => {
  if (isMockDatabaseMode) {
    return observateursMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("observateur", "libelle", "ASC") +
        getFindNumberOfDonneesByObservateurIdQuery()
    );
    return results[0];
  }
};

export const saveObservateur = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<number> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
    // callbackFn(null, observateursMock as Observateur[]);
  } else {
    // TODO
    const result = await SqlConnection.query(
      getSaveEntityQuery(
        "observateur",
        httpParameters.postData,
        DB_SAVE_MAPPING.observateur
      )
    );
    console.log(result);
    return (result as any).insertId;
  }
};

export const deleteObservateur = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<number> => {
  if (isMockDatabaseMode) {
    // TODO
    // callbackFn(null, observateursMock as Observateur[]);
    return null;
  } else {
    // TODO
    const result = await SqlConnection.query(
      getDeleteEntityByIdQuery(
        "observateur",
        +httpParameters.queryParameters.id
      )
    );
    console.log(result);
    return result as any;
  }
};

export const getDepartements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Departement[]> => {
  if (isMockDatabaseMode) {
    return departementsMock;
  } else {
    const result = await SqlConnection.query(
      getFindAllQuery("departement", "code", "ASC") +
        getFindNumberOfCommunesByDepartementIdQuery() +
        getFindNumberOfLieuxditsByDepartementIdQuery() +
        getFindNumberOfDonneesByDepartementIdQuery()
    );
    return result[0];
  }
};

export const saveDepartement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteDepartement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
) => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getCommunes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Commune[]> => {
  if (isMockDatabaseMode) {
    return communesMock as any[];
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("commune", "nom", "ASC") +
        getFindNumberOfLieuxditsByCommuneIdQuery() +
        getFindNumberOfDonneesByCommuneIdQuery()
    );
    const communes: Commune[] = _.map(results[0], (classeDb) => {
      const { departement_id, ...otherParams } = classeDb;
      return {
        ...otherParams,
        departementId: classeDb.departement_id
      };
    });
    return communes;
  }
};

export const saveCommune = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteCommune = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getLieuxdits = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Lieudit[]> => {
  if (isMockDatabaseMode) {
    return lieuxDitsMock as Lieudit[];
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("lieudit", "nom", "ASC") +
        getFindNumberOfDonneesByLieuditIdQuery()
    );
    const lieuxdits: Lieudit[] = _.map(results[0], (lieuditDb) => {
      const { commune_id, ...otherParams } = lieuditDb;
      return {
        ...otherParams,
        communeId: lieuditDb.commune_id
      };
    });

    return lieuxdits;
  }
};

export const saveLieudit = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteLieudit = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getMeteos = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Meteo[]> => {
  if (isMockDatabaseMode) {
    return Promise.resolve(meteosMock);
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("meteo", "libelle", "ASC")
    );
    return results as any;
  }
};

export const saveMeteo = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteMeteo = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getClasses = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Classe[]> => {
  if (isMockDatabaseMode) {
    return Promise.resolve(classesMock);
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("classe", "libelle", "ASC") +
        getFindNumberOfEspecesByClasseIdQuery() +
        getFindNumberOfDonneesByClasseIdQuery()
    );
    return results[0];
  }
};

export const saveClasse = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteClasse = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getEspeces = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Espece[]> => {
  if (isMockDatabaseMode) {
    return especesMock as Espece[];
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("espece", "code", "ASC") +
        getFindNumberOfDonneesByDoneeeEntityIdQuery("espece_id")
    );
    const especes: Espece[] = _.map(results[0], (especeDb) => {
      const { espece_id, ...otherParams } = especeDb;
      return {
        ...otherParams,
        especeId: especeDb.espece_id
      };
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

    const saveResult = await SqlConnection.query(
      getSaveEntityQuery("espece", especeToSave, DB_SAVE_MAPPING.espece)
    );
    return saveResult;
  }
};

export const deleteEspece = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getSexes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Sexe[]> => {
  if (isMockDatabaseMode) {
    return sexesMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("sexe", "libelle", "ASC") +
        getFindNumberOfDonneesBySexeIdQuery()
    );
    return results[0];
  }
};

export const saveSexe = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteSexe = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getAges = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Age[]> => {
  if (isMockDatabaseMode) {
    return agesMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("age", "libelle", "ASC") +
        getFindNumberOfDonneesByAgeIdQuery()
    );
    return results[0];
  }
};

export const saveAge = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteAge = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getEstimationsNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<EstimationNombre[]> => {
  if (isMockDatabaseMode) {
    return estimationsNombreMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("estimation_nombre", "libelle", "ASC")
    );
    return results[0];
  }
};

export const saveEstimationNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteEstimationNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getEstimationsDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<EstimationDistance[]> => {
  if (isMockDatabaseMode) {
    return estimationsDistanceMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("estimation_distance", "libelle", "ASC")
    );
    return results as any;
  }
};

export const saveEstimationDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteEstimationDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getComportements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Comportement[]> => {
  if (isMockDatabaseMode) {
    return comportementsMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("comportement", "libelle", "ASC")
    );
    return results as any;
  }
};

export const saveComportement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const deleteComportement = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    // TODO
    return null;
  } else {
    // TODO
  }
};

export const getMilieux = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<Milieu[]> => {
  if (isMockDatabaseMode) {
    return milieuxMock;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery("milieu", "libelle", "ASC")
    );
    return results as any;
  }
};

export const saveMilieu = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    return { affectedRows: 1, insertId: 132, warningStatus: 0 };
  } else {
    const saveResult = await SqlConnection.query(
      getSaveEntityQuery(
        "milieu",
        httpParameters.postData,
        DB_SAVE_MAPPING.milieu
      )
    );
    return saveResult;
  }
};

export const deleteMilieu = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    return { affectedRows: 1, insertId: 0, warningStatus: 0 };
  } else {
    const deleteResult = await SqlConnection.query(
      getDeleteEntityByIdQuery("milieu", +httpParameters.queryParameters.id)
    );
    return deleteResult;
  }
};
