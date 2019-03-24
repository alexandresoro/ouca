import { ConfigurationPage } from "basenaturaliste-model/configuration-page.object";
import { EntiteSimple } from "basenaturaliste-model/entite-simple.object";
import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters.js";
import configurationInitMock from "../mocks/configuration-page/configuration.json";
import { SqlConnection } from "../sql/sql-connection.js";
import { getFindAllQuery } from "../sql/sql-queries-utils.js";
import {
  COLUMN_CODE,
  COLUMN_LIBELLE,
  ORDER_ASC,
  TABLE_AGE,
  TABLE_CONFIGURATION,
  TABLE_DEPARTEMENT,
  TABLE_ESTIMATION_NOMBRE,
  TABLE_OBSERVATEUR,
  TABLE_SEXE
} from "../utils/constants.js";
import { toCamel } from "../utils/utils.js";

export const configurationInit = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<ConfigurationPage> => {
  if (isMockDatabaseMode) {
    return configurationInitMock as any;
  } else {
    const results = await SqlConnection.query(
      getFindAllQuery(TABLE_CONFIGURATION) +
        getFindAllQuery(TABLE_OBSERVATEUR, COLUMN_LIBELLE, ORDER_ASC) +
        getFindAllQuery(TABLE_DEPARTEMENT, COLUMN_CODE, ORDER_ASC) +
        getFindAllQuery(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC) +
        getFindAllQuery(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC) +
        getFindAllQuery(TABLE_ESTIMATION_NOMBRE, COLUMN_LIBELLE, ORDER_ASC)
    );

    const dbUiMapping = {
      application_name: toCamel("application_name"),
      observateur: "defaultObservateur",
      departement: "defaultDepartement",
      age: "defaultAge",
      sexe: "defaultSexe",
      estimation_nombre: "defaultEstimationNombre",
      nombre: "defaultNombre",
      are_associes_displayed: toCamel("are_associes_displayed"),
      is_meteo_displayed: toCamel("is_meteo_displayed"),
      is_distance_displayed: toCamel("is_distance_displayed"),
      is_regroupement_displayed: toCamel("is_regroupement_displayed"),
      mysql_path: "mySqlPath",
      mysqldump_path: "mySqlDumpPath"
    };

    const mappingDefaultWithList = {
      defaultObservateur: results[1],
      defaultDepartement: results[2],
      defaultAge: results[3],
      defaultSexe: results[4],
      defaultEstimationNombre: results[5]
    };

    const dbConfiguration: any = {};
    _.forEach(results[0], (field) => {
      const overridenName: string = _.find(dbUiMapping, (valueDb, keyDb) => {
        return field.libelle === keyDb;
      });
      const key: string = overridenName ? overridenName : field.libelle;
      let value = field.value;

      _.forEach(
        mappingDefaultWithList,
        (valueDefaultList: EntiteSimple[], keyDefaultList: string) => {
          if (key === keyDefaultList) {
            value = _.find(valueDefaultList, (fieldInList) => {
              return fieldInList.id === +field.value;
            });
          }
        }
      );

      dbConfiguration[key] = value;
    });

    return {
      appConfiguration: dbConfiguration,
      observateurs: results[1],
      departements: results[2],
      ages: results[3],
      sexes: results[4],
      estimationsNombre: results[5]
    };
  }
};

export const configurationUpdate = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<ConfigurationPage> => {
  if (isMockDatabaseMode) {
    // callbackFn(null, configurationInitMock as any);
    return null;
  } else {
    // TODO
  }
};
