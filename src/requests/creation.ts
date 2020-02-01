import { CreationPage } from "basenaturaliste-model/creation-page.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindComportementsIdsByDonneeId } from "../sql/sql-queries-comportement";
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
import { getQueryToFindMilieuxIdsByDonneeId } from "../sql/sql-queries-milieu";
import { getQueryToFindAssociesByInventaireId } from "../sql/sql-queries-observateur";
import {
  getDeleteEntityByIdQuery,
  getFindOneByIdQuery,
  getAllFromTablesSqlQuery
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
  TABLE_INVENTAIRE
} from "../utils/constants";
import {
  mapAssociesIds,
  mapComportementsIds,
  mapEspeces,
  mapEstimationsNombre,
  mapInventaire,
  mapMeteosIds,
  mapMilieuxIds,
  buildLieuxditsFromLieuxditsDb,
  buildCommunesFromCommunesDb
} from "../utils/mapping-utils";
import {
  buildPostResponseFromSqlResponse,
  buildErrorPostResponse
} from "../utils/post-response-utils";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { DonneeWithNavigationData } from "basenaturaliste-model/donnee-with-navigation-data.object";
import { FlatDonneeWithMinimalData } from "../objects/flat-donnee-with-minimal-data.object";
import { PostResponse } from "basenaturaliste-model/post-response.object";
import { Configuration } from "../objects/configuration.object";
import {
  persistDonnee,
  getExistingDonneeId,
  updateInventaireIdForDonnees,
  findLastDonneeId
} from "../sql-api/sql-api-donnee";
import {
  persistInventaire,
  getExistingInventaireId,
  deleteInventaireById,
  findInventaireIdById
} from "../sql-api/sql-api-inventaire";

const buildDonneeFromFlatDonneeWithMinimalData = async (
  flatDonnee: FlatDonneeWithMinimalData
): Promise<Donnee> => {
  if (!!flatDonnee && !!flatDonnee.id && !!flatDonnee.inventaireId) {
    const listsResults = await SqlConnection.query(
      getQueryToFindAssociesByInventaireId(flatDonnee.inventaireId) +
        getQueryToFindMetosByInventaireId(flatDonnee.inventaireId) +
        getQueryToFindComportementsIdsByDonneeId(flatDonnee.id) +
        getQueryToFindMilieuxIdsByDonneeId(flatDonnee.id) +
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
      customizedAltitude: flatDonnee.altitude,
      customizedCoordinatesL2E: {
        longitude: flatDonnee.longitudeL2E,
        latitude: flatDonnee.latitudeL2E
      },
      customizedCoordinatesL93: {
        longitude: null,
        latitude: null
      },
      customizedCoordinatesGPS: {
        longitude: null,
        latitude: null
      },
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

const getConfigurationValueAsString = (
  configurations: Configuration[],
  libelle: string
): string => {
  return _.find(
    configurations,
    (configuration) => configuration.libelle === libelle
  ).value;
};

const getConfigurationValueAsNumber = (
  configurations: Configuration[],
  libelle: string
): number => {
  return +getConfigurationValueAsString(configurations, libelle);
};

const getConfigurationValueAsBoolean = (
  configurations: Configuration[],
  libelle: string
): boolean => {
  return getConfigurationValueAsNumber(configurations, libelle) === 1;
};

export const creationInit = async (): Promise<CreationPage> => {
  const [
    lastDonneeInfo,
    numberOfDonnees,
    lastRegroupement,
    configuration,
    observateurs,
    departements,
    communes,
    lieuxditsDb,
    meteos,
    classes,
    especes,
    ages,
    sexes,
    estimationsNombre,
    estimationsDistance,
    comportements,
    milieux
  ] = await Promise.all(
    _.flatten([
      SqlConnection.query(getQueryToFindLastDonnee()),
      SqlConnection.query(getQueryToFindNumberOfDonnees()),
      SqlConnection.query(getQueryToFindLastRegroupement()),
      getAllFromTablesSqlQuery([
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
    ])
  );

  const lastDonnee: Donnee = await buildDonneeFromFlatDonneeWithMinimalData(
    lastDonneeInfo[0]
  );

  const configurations: Configuration[] = configuration;

  const creationPage: CreationPage = {
    lastDonnee,
    numberOfDonnees: numberOfDonnees[0].nbDonnees,
    nextRegroupement: lastRegroupement[0].regroupement + 1,
    defaultObservateurId: getConfigurationValueAsNumber(
      configurations,
      KEY_DEFAULT_OBSERVATEUR_ID
    ),
    defaultDepartementId: getConfigurationValueAsNumber(
      configurations,
      KEY_DEFAULT_DEPARTEMENT_ID
    ),
    defaultEstimationNombreId: getConfigurationValueAsNumber(
      configurations,
      KEY_DEFAULT_ESTIMATION_NOMBRE_ID
    ),
    defaultNombre: getConfigurationValueAsNumber(
      configurations,
      KEY_DEFAULT_NOMBRE
    ),
    defaultSexeId: getConfigurationValueAsNumber(
      configurations,
      KEY_DEFAULT_SEXE_ID
    ),
    defaultAgeId: getConfigurationValueAsNumber(
      configurations,
      KEY_DEFAULT_AGE_ID
    ),
    areAssociesDisplayed: getConfigurationValueAsBoolean(
      configurations,
      KEY_ARE_ASSOCIES_DISPLAYED
    ),
    isMeteoDisplayed: getConfigurationValueAsBoolean(
      configurations,
      KEY_IS_METEO_DISPLAYED
    ),
    isDistanceDisplayed: getConfigurationValueAsBoolean(
      configurations,
      KEY_IS_DISTANCE_DISPLAYED
    ),
    isRegroupementDisplayed: getConfigurationValueAsBoolean(
      configurations,
      KEY_IS_REGROUPEMENT_DISPLAYED
    ),
    observateurs: observateurs,
    departements: departements,
    communes: buildCommunesFromCommunesDb(communes),
    lieudits: buildLieuxditsFromLieuxditsDb(lieuxditsDb),
    meteos: meteos,
    classes: classes,
    especes: mapEspeces(especes),
    ages: ages,
    sexes: sexes,
    estimationsNombre: mapEstimationsNombre(estimationsNombre),
    estimationsDistance: estimationsDistance,
    comportements: comportements,
    milieux: milieux
  };

  return creationPage;
};

export const saveInventaire = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const inventaireToSave: Inventaire = httpParameters.postData;

  let sqlResponse: SqlSaveResponse;

  const existingId: number = await getExistingInventaireId(inventaireToSave);

  if (existingId) {
    // A similar inventaire already exists
    // We use it instead of creating a duplicated inventaire

    if (inventaireToSave.id) {
      // We update the inventaire ID for the donnees and we delete the duplicated inventaire
      await updateInventaireIdForDonnees(inventaireToSave.id, existingId);
      await deleteInventaireById(inventaireToSave.id);
    }

    sqlResponse = {
      insertId: existingId,
      warningStatus: null,
      affectedRows: 0
    };
  } else {
    // Save the inventaire
    sqlResponse = await persistInventaire(inventaireToSave);
  }

  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const saveDonnee = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const donneeToSave: Donnee = httpParameters.postData;

  // Check if the donnee already exists or not
  const existingDonneeId: number = await getExistingDonneeId(donneeToSave);

  if (existingDonneeId) {
    // The donnee already exists so we return an error
    return buildErrorPostResponse(
      "Cette donnée existe déjà (ID = " + existingDonneeId + ")."
    );
  } else {
    const saveDonneeResponse: SqlSaveResponse = await persistDonnee(
      donneeToSave
    );

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
): Promise<DonneeWithNavigationData> => {
  const id: number = +httpParameters.queryParameters.id;
  const results = await SqlConnection.query(
    getQueryToFindDonneeById(id) +
      getQueryToFindPreviousDonneeByCurrentDonneeId(id) +
      getQueryToFindNextDonneeByCurrentDonneeId(id) +
      getQueryToFindDonneeIndexById(id)
  );

  const donnee = await buildDonneeFromFlatDonneeWithMinimalData(results[0][0]);

  return {
    ...donnee,
    previousDonneeId: results[1][0] ? results[1][0].id : null,
    nextDonneeId: results[2][0] ? results[2][0].id : null,
    indexDonnee:
      !!results[3] && !!results[3][0] ? results[3][0].nbDonnees : null
  };
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
  return findInventaireIdById(+httpParameters.queryParameters.id);
};

export const getLastDonneeId = async (): Promise<number> => {
  return findLastDonneeId();
};
