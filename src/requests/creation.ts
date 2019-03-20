import { CreationPage } from "basenaturaliste-model/creation-page.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import * as _ from "lodash";
import * as mysql from "mysql";
import { HttpParameters } from "../http/httpParameters.js";
import creationPageCreateDonneeMock from "../mocks/creation-page/creation-page-create-donnee.json";
import creationPageCreateInventaireMock from "../mocks/creation-page/creation-page-create-inventaire.json";
import creationPageInitMock from "../mocks/creation-page/creation-page-init.json";
import { SqlConnection } from "../sql/sql-connection.js";
import {
  DB_SAVE_MAPPING,
  getAllFromTablesQuery,
  getDeleteEntityByIdQuery,
  getFindAssociesByInventaireIdQuery,
  getFindComportementsByDonneeIdQuery,
  getFindLastDonneeQuery,
  getFindLastRegroupementQuery,
  getFindMetosByInventaireIdQuery,
  getFindMilieuxByDonneeIdQuery,
  getFindNextDonneeByCurrentDonneeIdQuery,
  getFindNumberOfDonneesQuery,
  getFindPreviousDonneeByCurrentDonneeIdQuery,
  getSaveEntityQuery
} from "../sql/sql-queries-utils.js";

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

export function creationInit(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: CreationPage) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, creationPageInitMock as any);
  } else {
    SqlConnection.query(
      getFindLastDonneeQuery() +
        getFindNumberOfDonneesQuery() +
        getFindLastRegroupementQuery() +
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
        ]),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          const creationPage: CreationPage = {
            lastDonnee: results[0][0],
            numberOfDonnees: results[1][0].nbDonnees,
            nextRegroupement: results[2][0].regroupement,
            defaultObservateurId: getDefaultValueForConfigurationField(
              results[3],
              "observateur",
              false,
              true
            ),
            defaultDepartementId: getDefaultValueForConfigurationField(
              results[3],
              "departement",
              false,
              true
            ),
            defaultEstimationNombreId: getDefaultValueForConfigurationField(
              results[3],
              "estimation_nombre",
              false,
              true
            ),
            defaultNombre: getDefaultValueForConfigurationField(
              results[3],
              "nombre",
              false,
              true
            ),
            defaultSexeId: getDefaultValueForConfigurationField(
              results[3],
              "sexe",
              false,
              true
            ),
            defaultAgeId: getDefaultValueForConfigurationField(
              results[3],
              "age",
              false,
              true
            ),
            areAssociesDisplayed: getDefaultValueForConfigurationField(
              results[3],
              "are_associes_displayed",
              true
            ),
            isMeteoDisplayed: getDefaultValueForConfigurationField(
              results[3],
              "is_meteo_displayed",
              true
            ),
            isDistanceDisplayed: getDefaultValueForConfigurationField(
              results[3],
              "is_distance_displayed",
              true
            ),
            isRegroupementDisplayed: getDefaultValueForConfigurationField(
              results[3],
              "is_regroupement_displayed",
              true
            ),
            observateurs: results[4],
            departements: results[5],
            communes: _.map(results[6], (communeDb) => {
              const { departement_id, ...otherParams } = communeDb;
              return {
                ...otherParams,
                departementId: communeDb.departement_id
              };
            }),
            lieudits: _.map(results[7], (lieuDitDb) => {
              const { commune_id, ...otherParams } = lieuDitDb;
              return {
                ...otherParams,
                communeId: lieuDitDb.commune_id
              };
            }),
            meteos: results[8],
            classes: results[9],
            especes: _.map(results[10], (especeDb) => {
              const { classe_id, ...otherParams } = especeDb;
              return {
                ...otherParams,
                classeId: especeDb.classe_id
              };
            }),
            ages: results[11],
            sexes: results[12],
            estimationsNombre: results[13],
            estimationsDistance: results[14],
            comportements: results[15],
            milieux: results[16]
          };

          callbackFn(errors, creationPage);
        }
      }
    );
  }
}

export function creationInventaire(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Inventaire) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, creationPageCreateInventaireMock as any);
  } else {
    SqlConnection.query(
      getSaveEntityQuery("inventaire", null, DB_SAVE_MAPPING.inventaire),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          console.log("SQL Result:", results);
          callbackFn(errors, results[0]);
        }
      }
    );
  }
}

export function creationDonnee(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Donnee) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, creationPageCreateDonneeMock as any);
  } else {
    SqlConnection.query(
      getSaveEntityQuery("donnee", null, DB_SAVE_MAPPING.donnee),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          console.log("SQL Result:", results);
          callbackFn(errors, results[0]);
        }
      }
    );
  }
}

export function deleteDonnee(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    SqlConnection.query(
      getDeleteEntityByIdQuery("donnee", +httpParameters.queryParameters.id),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          console.log("SQL Result:", results);
          callbackFn(errors, results[0]);
        }
      }
    );
  }
}

export function getNextDonnee(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    SqlConnection.query(
      getFindNextDonneeByCurrentDonneeIdQuery(158181),
      (error, result) => {
        if (error) {
          callbackFn(error, null);
        } else {
          console.log("SQL Result:", result);
          callbackFn(error, result[0][0] as Donnee[]);
        }
      }
    );
  }
}

export function getPreviousDonnee(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Donnee) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    SqlConnection.query(
      getFindPreviousDonneeByCurrentDonneeIdQuery(
        +httpParameters.queryParameters.id
      ),
      (error, result) => {
        if (error) {
          callbackFn(error, null);
        } else {
          const flatDonnee = result[0];

          SqlConnection.query(
            getFindAssociesByInventaireIdQuery(flatDonnee.inventaireId) +
              getFindMetosByInventaireIdQuery(flatDonnee.inventaireId) +
              getFindComportementsByDonneeIdQuery(flatDonnee.id) +
              getFindMilieuxByDonneeIdQuery(flatDonnee.id),
            (errors, results) => {
              if (error) {
                callbackFn(errors, null);
              } else {
                const inventaire: Inventaire = {
                  id: flatDonnee.inventaireId,
                  observateurId: flatDonnee.observateurId,
                  associes: results[0],
                  date: flatDonnee.date,
                  heure: flatDonnee.heure,
                  duree: flatDonnee.duree,
                  lieuditId: flatDonnee.lieuditId,
                  altitude: flatDonnee.altitude,
                  longitude: flatDonnee.longitude,
                  latitude: flatDonnee.latitude,
                  temperature: flatDonnee.temperature,
                  meteos: results[1]
                };
                const donnee: Donnee = {
                  id: flatDonnee.id,
                  inventaireId: flatDonnee.inventaireId,
                  inventaire,
                  especeId: flatDonnee.especeId,
                  sexeId: flatDonnee.sexeId,
                  ageId: flatDonnee.ageId,
                  estimationNombreId: flatDonnee.estimationNombreId,
                  nombre: flatDonnee,
                  estimationDistanceId: flatDonnee.estimationDistanceId,
                  distance: flatDonnee.distance,
                  regroupement: flatDonnee.regroupement,
                  comportements: results[2],
                  milieux: results[3],
                  commentaire: flatDonnee.commentaire
                };
                callbackFn(error, donnee);
              }
            }
          );
        }
      }
    );
  }
}

export function getNextRegroupement(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    SqlConnection.query(getFindLastRegroupementQuery(), (errors, results) => {
      if (errors) {
        callbackFn(errors, null);
      } else {
        console.log("SQL Result:", results);
        callbackFn(errors, (results[0][0].regroupement as number) + 1);
      }
    });
  }
}
