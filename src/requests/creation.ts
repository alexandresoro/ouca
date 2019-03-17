import { CreationPage } from "basenaturaliste-model/creation-page.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import * as _ from "lodash";
import * as mysql from "mysql";
import creationPageCreateDonneeMock from "../mocks/creation-page/creation-page-create-donnee.json";
import creationPageCreateInventaireMock from "../mocks/creation-page/creation-page-create-inventaire.json";
import creationPageInitMock from "../mocks/creation-page/creation-page-init.json";
import { getAllFromTablesQuery, SqlConnection } from "../sql/sql-connection.js";

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
  callbackFn: (errors: mysql.MysqlError, result: CreationPage) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, creationPageInitMock as any);
  } else {
    SqlConnection.query(
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
          const creationPage: any = {
            defaultObservateurId: getDefaultValueForConfigurationField(
              results[0],
              "observateur",
              false,
              true
            ),
            defaultDepartementId: getDefaultValueForConfigurationField(
              results[0],
              "departement",
              false,
              true
            ),
            defaultEstimationNombreId: getDefaultValueForConfigurationField(
              results[0],
              "estimation_nombre",
              false,
              true
            ),
            defaultNombre: getDefaultValueForConfigurationField(
              results[0],
              "nombre",
              false,
              true
            ),
            defaultSexeId: getDefaultValueForConfigurationField(
              results[0],
              "sexe",
              false,
              true
            ),
            defaultAgeId: getDefaultValueForConfigurationField(
              results[0],
              "age",
              false,
              true
            ),
            areAssociesDisplayed: getDefaultValueForConfigurationField(
              results[0],
              "are_associes_displayed",
              true
            ),
            isMeteoDisplayed: getDefaultValueForConfigurationField(
              results[0],
              "is_meteo_displayed",
              true
            ),
            isDistanceDisplayed: getDefaultValueForConfigurationField(
              results[0],
              "is_distance_displayed",
              true
            ),
            isRegroupementDisplayed: getDefaultValueForConfigurationField(
              results[0],
              "is_regroupement_displayed",
              true
            ),
            observateurs: results[1],
            departements: results[2],
            communes: _.map(results[3], (communeDb) => {
              const { departement_id, ...otherParams } = communeDb;
              return {
                ...otherParams,
                departementId: communeDb.departement_id
              };
            }),
            lieudits: _.map(results[4], (lieuDitDb) => {
              const { commune_id, ...otherParams } = lieuDitDb;
              return {
                ...otherParams,
                communeId: lieuDitDb.commune_id
              };
            }),
            meteos: results[5],
            classes: results[6],
            especes: _.map(results[7], (especeDb) => {
              const { classe_id, ...otherParams } = especeDb;
              return {
                ...otherParams,
                classeId: especeDb.classe_id
              };
            }),
            ages: results[8],
            sexes: results[9],
            estimationsNombre: results[10],
            estimationsDistance: results[11],
            comportements: results[12],
            milieux: results[13]
          };

          callbackFn(errors, creationPage);
        }
      }
    );
  }
}

export function creationInventaire(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Inventaire) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, creationPageCreateInventaireMock as any);
  } else {
    // TODO
  }
}

export function creationDonnee(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: Donnee) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, creationPageCreateDonneeMock as any);
  } else {
    // TODO
  }
}

export function deleteDonnee(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    // TODO
  }
}

export function getNextDonnee(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    // TODO
  }
}

export function getPreviousDonnee(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    // TODO
  }
}

export function getNextRegroupement(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, null);
  } else {
    // TODO
  }
}
