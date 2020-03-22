import * as _ from "lodash";
import {
  CoordinatesSystemType,
  COORDINATES_SYSTEMS
} from "ouca-common/coordinates-system/coordinates-system.object";
import { CreationPage } from "ouca-common/creation-page.object";
import { DonneeWithNavigationData } from "ouca-common/donnee-with-navigation-data.object";
import { Donnee } from "ouca-common/donnee.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { PostResponse } from "ouca-common/post-response.object";
import { HttpParameters } from "../http/httpParameters";
import { buildLieuxditsFromLieuxditsDb } from "../mapping/lieudit-mapping";
import { Configuration } from "../objects/configuration.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  buildDonneeFromFlatDonneeWithMinimalData,
  deleteDonneeById,
  findLastDonneeId,
  findNextDonneeByCurrentDonneeId,
  findPreviousDonneeByCurrentDonneeId,
  getExistingDonneeId,
  persistDonnee,
  updateInventaireIdForDonnees
} from "../sql-api/sql-api-donnee";
import {
  deleteInventaireById,
  findInventaireById,
  findInventaireIdById,
  getExistingInventaireId,
  persistInventaire
} from "../sql-api/sql-api-inventaire";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getQueryToFindDonneeById,
  getQueryToFindDonneeIndexById,
  getQueryToFindLastDonnee,
  getQueryToFindLastRegroupement,
  getQueryToFindNextDonneeByCurrentDonneeId,
  getQueryToFindNumberOfDonnees,
  getQueryToFindPreviousDonneeByCurrentDonneeId
} from "../sql/sql-queries-donnee";
import { getAllFromTablesSqlQuery } from "../sql/sql-queries-utils";
import {
  KEY_ARE_ASSOCIES_DISPLAYED,
  KEY_COORDINATES_SYSTEM,
  KEY_DEFAULT_AGE_ID,
  KEY_DEFAULT_DEPARTEMENT_ID,
  KEY_DEFAULT_ESTIMATION_NOMBRE_ID,
  KEY_DEFAULT_NOMBRE,
  KEY_DEFAULT_OBSERVATEUR_ID,
  KEY_DEFAULT_SEXE_ID,
  KEY_IS_DISTANCE_DISPLAYED,
  KEY_IS_METEO_DISPLAYED,
  KEY_IS_REGROUPEMENT_DISPLAYED,
  TABLE_AGE,
  TABLE_CLASSE,
  TABLE_COMMUNE,
  TABLE_COMPORTEMENT,
  TABLE_CONFIGURATION,
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
import {
  buildCommunesFromCommunesDb,
  mapEspeces,
  mapEstimationsNombre
} from "../utils/mapping-utils";
import {
  buildErrorPostResponse,
  buildPostResponseFromSqlResponse
} from "../utils/post-response-utils";

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
        TABLE_CONFIGURATION,
        TABLE_OBSERVATEUR,
        TABLE_DEPARTEMENT,
        TABLE_COMMUNE,
        TABLE_LIEUDIT,
        TABLE_METEO,
        TABLE_CLASSE,
        TABLE_ESPECE,
        TABLE_AGE,
        TABLE_SEXE,
        TABLE_ESTIMATION_NOMBRE,
        TABLE_ESTIMATION_DISTANCE,
        TABLE_COMPORTEMENT,
        TABLE_MILIEU
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
    coordinatesSystem: _.find(
      COORDINATES_SYSTEMS,
      (system: CoordinatesSystemType) => {
        return (
          getConfigurationValueAsString(
            configurations,
            KEY_COORDINATES_SYSTEM
          ) === system
        );
      }
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
  const donneeId: number = +httpParameters.queryParameters.donneeId;
  const inventaireId: number = +httpParameters.queryParameters.inventaireId;

  const sqlResponse: SqlSaveResponse = await deleteDonneeById(
    donneeId,
    inventaireId
  );

  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getNextDonnee = async (
  httpParameters: HttpParameters
): Promise<Donnee> => {
  const donneeId: number = +httpParameters.queryParameters.id;
  return findNextDonneeByCurrentDonneeId(donneeId);
};

export const getPreviousDonnee = async (
  httpParameters: HttpParameters
): Promise<Donnee> => {
  const donneeId: number = +httpParameters.queryParameters.id;
  return findPreviousDonneeByCurrentDonneeId(donneeId);
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
  return findInventaireById(inventaireId);
};

export const getInventaireIdById = async (
  httpParameters: HttpParameters
): Promise<number> => {
  return findInventaireIdById(+httpParameters.queryParameters.id);
};

export const getLastDonneeId = async (): Promise<number> => {
  return findLastDonneeId();
};
