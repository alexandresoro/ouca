import { CreationPage } from "basenaturaliste-model/creation-page.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import * as _ from "lodash";
import moment from "moment";
import { HttpParameters } from "../http/httpParameters";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindComportementsByDonneeId } from "../sql/sql-queries-comportement";
import {
  getQueryToFindDonneeById,
  getQueryToFindDonneeIndexById,
  getQueryToFindLastDonnee,
  getQueryToFindLastRegroupement,
  getQueryToFindNextDonneeByCurrentDonneeId,
  getQueryToFindNumberOfDonnees,
  getQueryToFindNumberOfDonneesByDoneeeEntityId,
  getQueryToFindPreviousDonneeByCurrentDonneeId,
  getQueryToCountDonneesByInventaireId
} from "../sql/sql-queries-donnee";
import { getQueryToFindMetosByInventaireId } from "../sql/sql-queries-meteo";
import { getQueryToFindMilieuxByDonneeId } from "../sql/sql-queries-milieu";
import { getQueryToFindAssociesByInventaireId } from "../sql/sql-queries-observateur";
import {
  DB_SAVE_MAPPING,
  getAllFromTablesQuery,
  getDeleteEntityByAttributeQuery,
  getDeleteEntityByIdQuery,
  getFindOneByIdQuery,
  getSaveEntityQuery,
  getSaveListOfEntitesQueries
} from "../sql/sql-queries-utils";
import {
  KEY_ARE_ASSOCIES_DISPLAYED,
  KEY_DEFAULT_AGE_ID,
  KEY_DEFAULT_DEPARTEMENT_ID,
  KEY_DEFAULT_ESTIMATION_NOMBRE_ID,
  KEY_DEFAULT_NOMBRE,
  KEY_DEFAULT_OBSERVATEUR_ID,
  KEY_DEFAULT_SEXE_ID,
  KEY_IS_DISTANCE_DISPLAYED,
  KEY_IS_METEO_DISPLAYED,
  KEY_IS_REGROUPEMENT_DISPLAYED,
  TABLE_DONNEE,
  TABLE_DONNEE_COMPORTEMENT,
  TABLE_DONNEE_MILIEU,
  TABLE_INVENTAIRE,
  TABLE_INVENTAIRE_ASSOCIE,
  TABLE_INVENTAIRE_METEO
} from "../utils/constants";
import {
  mapAssociesIds,
  mapCommunes,
  mapComportementsIds,
  mapEspeces,
  mapEstimationsNombre,
  mapInventaire,
  mapLieuxdits,
  mapMeteosIds,
  mapMilieuxIds
} from "../utils/mapping-utils";
import {
  buildPostResponseFromSqlResponse,
  buildErrorPostResponse
} from "../utils/post-response-utils";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { FlatDonneeWithMinimalData } from "../objects/flat-donnee-with-minimal-data.object";
import { PostResponse } from "basenaturaliste-model/post-response.object";
import { getQueryToFindInventaireIdById } from "../sql/sql-queries-inventaire";

const getDefaultValueForConfigurationField = (
  configuration: any[],
  libelle: string,
  isBoolean?: boolean,
  isNumber?: boolean
): any | number | boolean => {
  const retrievedValue = _.find(
    configuration,
    (value) => value.libelle === libelle
  ).value;
  if (isBoolean) {
    return +retrievedValue === 1;
  } else if (isNumber) {
    return +retrievedValue;
  } else {
    return retrievedValue;
  }
};

export const creationInit = async (): Promise<CreationPage> => {
  const results = await SqlConnection.query(
    getQueryToFindLastDonnee() +
      getQueryToFindNumberOfDonnees() +
      getQueryToFindLastRegroupement() +
      getAllFromTablesQuery([
        "configuration",
        "observateur",
        "departement",
        "commune",
        "lieudit",
        "meteo",
        "classe",
        "espece",
        "age",
        "sexe",
        "estimation_nombre",
        "estimation_distance",
        "comportement",
        "milieu"
      ])
  );

  const lastDonnee: Donnee = await buildDonneeFromFlatDonneeWithMinimalData(
    results[0][0]
  );

  const creationPage: CreationPage = {
    lastDonnee,
    numberOfDonnees: results[1][0].nbDonnees,
    nextRegroupement: results[2][0].regroupement + 1,
    defaultObservateurId: getDefaultValueForConfigurationField(
      results[3],
      KEY_DEFAULT_OBSERVATEUR_ID,
      false,
      true
    ),
    defaultDepartementId: getDefaultValueForConfigurationField(
      results[3],
      KEY_DEFAULT_DEPARTEMENT_ID,
      false,
      true
    ),
    defaultEstimationNombreId: getDefaultValueForConfigurationField(
      results[3],
      KEY_DEFAULT_ESTIMATION_NOMBRE_ID,
      false,
      true
    ),
    defaultNombre: getDefaultValueForConfigurationField(
      results[3],
      KEY_DEFAULT_NOMBRE,
      false,
      true
    ),
    defaultSexeId: getDefaultValueForConfigurationField(
      results[3],
      KEY_DEFAULT_SEXE_ID,
      false,
      true
    ),
    defaultAgeId: getDefaultValueForConfigurationField(
      results[3],
      KEY_DEFAULT_AGE_ID,
      false,
      true
    ),
    areAssociesDisplayed: getDefaultValueForConfigurationField(
      results[3],
      KEY_ARE_ASSOCIES_DISPLAYED,
      true
    ),
    isMeteoDisplayed: getDefaultValueForConfigurationField(
      results[3],
      KEY_IS_METEO_DISPLAYED,
      true
    ),
    isDistanceDisplayed: getDefaultValueForConfigurationField(
      results[3],
      KEY_IS_DISTANCE_DISPLAYED,
      true
    ),
    isRegroupementDisplayed: getDefaultValueForConfigurationField(
      results[3],
      KEY_IS_REGROUPEMENT_DISPLAYED,
      true
    ),
    observateurs: results[4],
    departements: results[5],
    communes: mapCommunes(results[6]),
    lieudits: mapLieuxdits(results[7]),
    meteos: results[8],
    classes: results[9],
    especes: mapEspeces(results[10]),
    ages: results[11],
    sexes: results[12],
    estimationsNombre: mapEstimationsNombre(results[13]),
    estimationsDistance: results[14],
    comportements: results[15],
    milieux: results[16]
  };

  return creationPage;
};

export const saveInventaire = async (
  httpParameters: HttpParameters
): Promise<SqlSaveResponse> => {
  const inventaireToSave: Inventaire = httpParameters.postData;
  const { date, ...otherParams } = inventaireToSave;

  // It is an update we delete the current associes and meteos to insert later the updated ones
  if (inventaireToSave.id) {
    await SqlConnection.query(
      getDeleteEntityByAttributeQuery(
        TABLE_INVENTAIRE_ASSOCIE,
        "inventaire_id",
        inventaireToSave.id
      ) +
        getDeleteEntityByAttributeQuery(
          TABLE_INVENTAIRE_METEO,
          "inventaire_id",
          inventaireToSave.id
        )
    );
  }

  const inventaireResult = await SqlConnection.query(
    getSaveEntityQuery(
      TABLE_INVENTAIRE,
      {
        date: moment(date).format("YYYY-MM-DD"),
        dateCreation: moment().format("YYYY-MM-DD HH:mm:ss"),
        ...otherParams
      },
      DB_SAVE_MAPPING.inventaire
    )
  );

  // If it is an update we take the existing ID else we take the inserted ID
  const inventaireId: number = inventaireToSave.id
    ? inventaireToSave.id
    : inventaireResult.insertId;

  if (inventaireToSave.associesIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_INVENTAIRE_ASSOCIE,
        inventaireId,
        inventaireToSave.associesIds
      )
    );
  }

  if (inventaireToSave.meteosIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_INVENTAIRE_METEO,
        inventaireId,
        inventaireToSave.meteosIds
      )
    );
  }

  return inventaireResult;
};

export const saveDonnee = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const donneeToSave: Donnee = httpParameters.postData;

  // Check if the donnee already exists or not
  const existingDonneeId: number = null; // TO DO

  if (existingDonneeId && existingDonneeId !== donneeToSave.id) {
    // The donnee already exists so we return an error
    return buildErrorPostResponse(
      "Cette donnée existe déjà (ID = " + existingDonneeId + ")."
    );
  } else {
    // The donnee does not exists yet, we save it

    if (donneeToSave.id) {
      // It is an update: we delete the current comportements
      // and milieux to insert later the updated ones
      await SqlConnection.query(
        getDeleteEntityByAttributeQuery(
          TABLE_DONNEE_COMPORTEMENT,
          "donnee_id",
          donneeToSave.id
        ) +
          getDeleteEntityByAttributeQuery(
            TABLE_DONNEE_MILIEU,
            "donnee_id",
            donneeToSave.id
          )
      );
    }

    const saveDonneeResponse: SqlSaveResponse = await SqlConnection.query(
      getSaveEntityQuery(
        TABLE_DONNEE,
        {
          ...donneeToSave,
          dateCreation: moment().format("YYYY-MM-DD HH:mm:ss")
        },
        DB_SAVE_MAPPING.donnee
      )
    );

    // If it is an update we take the existing ID else we take the inserted ID
    const savedDonneeId: number = donneeToSave.id
      ? donneeToSave.id
      : saveDonneeResponse.insertId;

    // Save the comportements
    if (donneeToSave.comportementsIds.length > 0) {
      await SqlConnection.query(
        getSaveListOfEntitesQueries(
          TABLE_DONNEE_COMPORTEMENT,
          savedDonneeId,
          donneeToSave.comportementsIds
        )
      );
    }

    // Save the milieux
    if (donneeToSave.milieuxIds.length > 0) {
      await SqlConnection.query(
        getSaveListOfEntitesQueries(
          TABLE_DONNEE_MILIEU,
          savedDonneeId,
          donneeToSave.milieuxIds
        )
      );
    }

    return buildPostResponseFromSqlResponse(saveDonneeResponse);
  }
};

export const deleteDonnee = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  // First delete the donnee
  const sqlResponse: SqlSaveResponse = await SqlConnection.query(
    getDeleteEntityByIdQuery(
      TABLE_DONNEE,
      +httpParameters.queryParameters.donneeId
    )
  );

  const inventaireId: number = +httpParameters.queryParameters.inventaireId;

  // Check how many donnees the inventaire has after the deletion
  const nbDonneesResponse = await SqlConnection.query(
    getQueryToCountDonneesByInventaireId(inventaireId)
  );

  if (nbDonneesResponse[0].nbDonnees === 0) {
    // If the inventaire has no more donnees then we remove the inventaire
    await SqlConnection.query(
      getDeleteEntityByIdQuery(TABLE_INVENTAIRE, inventaireId)
    );
  }

  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getNextDonnee = async (
  httpParameters: HttpParameters
): Promise<Donnee> => {
  const donneeResult = await SqlConnection.query(
    getQueryToFindNextDonneeByCurrentDonneeId(
      +httpParameters.queryParameters.id
    )
  );

  return await buildDonneeFromFlatDonneeWithMinimalData(donneeResult[0]);
};

export const getPreviousDonnee = async (
  httpParameters: HttpParameters
): Promise<Donnee> => {
  const donneeResult = await SqlConnection.query(
    getQueryToFindPreviousDonneeByCurrentDonneeId(
      +httpParameters.queryParameters.id
    )
  );

  return await buildDonneeFromFlatDonneeWithMinimalData(donneeResult[0]);
};

export const getDonneeByIdWithContext = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const id: number = +httpParameters.queryParameters.id;
  const results = await SqlConnection.query(
    getQueryToFindDonneeById(id) +
      getQueryToFindPreviousDonneeByCurrentDonneeId(id) +
      getQueryToFindNextDonneeByCurrentDonneeId(id) +
      getQueryToFindDonneeIndexById(id)
  );

  return {
    donnee: await buildDonneeFromFlatDonneeWithMinimalData(results[0][0]),
    previousDonnee: await buildDonneeFromFlatDonneeWithMinimalData(
      results[1][0]
    ),
    nextDonnee: await buildDonneeFromFlatDonneeWithMinimalData(results[2][0]),
    indexDonnee:
      !!results[3] && !!results[3][0] ? results[3][0].nbDonnees : null
  };
};

const buildDonneeFromFlatDonneeWithMinimalData = async (
  flatDonnee: FlatDonneeWithMinimalData
): Promise<Donnee> => {
  if (!!flatDonnee && !!flatDonnee.id && !!flatDonnee.inventaireId) {
    const listsResults = await SqlConnection.query(
      getQueryToFindAssociesByInventaireId(flatDonnee.inventaireId) +
        getQueryToFindMetosByInventaireId(flatDonnee.inventaireId) +
        getQueryToFindComportementsByDonneeId(flatDonnee.id) +
        getQueryToFindMilieuxByDonneeId(flatDonnee.id) +
        getQueryToFindNumberOfDonneesByDoneeeEntityId(
          "inventaire_id",
          flatDonnee.inventaireId
        )
    );

    const inventaire: Inventaire = {
      id: flatDonnee.inventaireId,
      observateurId: flatDonnee.observateurId,
      associesIds: mapAssociesIds(listsResults[0]),
      date: flatDonnee.date,
      heure: flatDonnee.heure,
      duree: flatDonnee.duree,
      lieuditId: flatDonnee.lieuditId,
      altitude: flatDonnee.altitude,
      longitude: flatDonnee.longitude,
      latitude: flatDonnee.latitude,
      temperature: flatDonnee.temperature,
      meteosIds: mapMeteosIds(listsResults[1]),
      nbDonnees: listsResults[4][0].nbDonnees
    };

    const donnee: Donnee = {
      id: flatDonnee.id,
      inventaireId: flatDonnee.inventaireId,
      inventaire,
      especeId: flatDonnee.especeId,
      sexeId: flatDonnee.sexeId,
      ageId: flatDonnee.ageId,
      estimationNombreId: flatDonnee.estimationNombreId,
      nombre: flatDonnee.nombre,
      estimationDistanceId: flatDonnee.estimationDistanceId,
      distance: flatDonnee.distance,
      regroupement: flatDonnee.regroupement,
      comportementsIds: mapComportementsIds(listsResults[2]),
      milieuxIds: mapMilieuxIds(listsResults[3]),
      commentaire: flatDonnee.commentaire
    };
    return donnee;
  } else {
    return null;
  }
};

export const getNextRegroupement = async (): Promise<number> => {
  const results = await SqlConnection.query(getQueryToFindLastRegroupement());
  return (results[0].regroupement as number) + 1;
};

export const getInventaireById = async (
  httpParameters: HttpParameters
): Promise<Inventaire> => {
  const inventaireId: number = +httpParameters.queryParameters.id;

  const results = await SqlConnection.query(
    getFindOneByIdQuery(TABLE_INVENTAIRE, inventaireId) +
      getQueryToFindAssociesByInventaireId(inventaireId) +
      getQueryToFindMetosByInventaireId(inventaireId)
  );

  const inventaire: Inventaire = mapInventaire(results[0][0]);
  inventaire.associesIds = mapAssociesIds(results[1]);
  inventaire.meteosIds = mapMeteosIds(results[2]);

  return inventaire;
};

export const getInventaireIdById = async (
  httpParameters: HttpParameters
): Promise<number> => {
  const response = await SqlConnection.query(
    getQueryToFindInventaireIdById(+httpParameters.queryParameters.id)
  );
  return response[0] ? response[0].id : null;
};
