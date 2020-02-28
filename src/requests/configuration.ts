import * as _ from "lodash";
import { AppConfiguration } from "ouca-common/app-configuration.object";
import { ConfigurationPage } from "ouca-common/configuration-page.object";
import { EntiteSimple } from "ouca-common/entite-simple.object";
import { HttpParameters } from "../http/httpParameters";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  DB_CONFIGURATION_MAPPING,
  getFindAllQuery,
  updateAllInTableQuery
} from "../sql/sql-queries-utils";
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
} from "../utils/constants";

export const configurationInit = async (): Promise<ConfigurationPage> => {
  const results = await SqlConnection.query(
    getFindAllQuery(TABLE_CONFIGURATION) +
      getFindAllQuery(TABLE_OBSERVATEUR, COLUMN_LIBELLE, ORDER_ASC) +
      getFindAllQuery(TABLE_DEPARTEMENT, COLUMN_CODE, ORDER_ASC) +
      getFindAllQuery(TABLE_AGE, COLUMN_LIBELLE, ORDER_ASC) +
      getFindAllQuery(TABLE_SEXE, COLUMN_LIBELLE, ORDER_ASC) +
      getFindAllQuery(TABLE_ESTIMATION_NOMBRE, COLUMN_LIBELLE, ORDER_ASC)
  );

  // Mapping between the UI field and itd corresponding list queried
  const mappingDefaultWithList = {
    defaultObservateur: results[1],
    defaultDepartement: results[2],
    defaultAge: results[3],
    defaultSexe: results[4],
    defaultEstimationNombre: results[5]
  };

  // In configuration table, the following fields are set as "0" or "1", athough they represent boolean values
  const booleanValuesStoredAsBitsInDb = [
    "areAssociesDisplayed",
    "isMeteoDisplayed",
    "isDistanceDisplayed",
    "isRegroupementDisplayed"
  ];

  const dbConfiguration = {};
  _.forEach(results[0], (field) => {
    // First try to find if the column name returned from the DB has a UI name that overrides it
    const overridenName: string = _.find(
      DB_CONFIGURATION_MAPPING,
      (valueDb, keyDb) => {
        return field.libelle === keyDb;
      }
    );
    const key: string = overridenName ? overridenName : field.libelle;

    // By default, the value of the field is the one returned from the DB
    let value = field.value;

    // If the field is supposed to be treated as a boolean field, we remap the 0/1 to booleans
    if (booleanValuesStoredAsBitsInDb.includes(key)) {
      value = !!+value;
    }

    // In the UI, some default fields manage a whole object, and not only the id returned in the DB
    // Here, we replace the id by the object itself
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

  // TO DO get from DB
  /*
  dbConfiguration["coordinatesSystem"] = _.find(
    COORDINATES_SYSTEMS,
    (system) => {
      return system.code === "lambert_II_etendu";
    }
  );
  */

  return {
    appConfiguration: dbConfiguration as AppConfiguration,
    observateurs: results[1],
    departements: results[2],
    ages: results[3],
    sexes: results[4],
    estimationsNombre: results[5]
  };
};

export const configurationUpdate = async (
  httpParameters: HttpParameters
): Promise<ConfigurationPage> => {
  const configurationToSave: AppConfiguration = httpParameters.postData;

  const {
    defaultAge,
    defaultDepartement,
    defaultEstimationNombre,
    defaultObservateur,
    defaultSexe,
    areAssociesDisplayed,
    isMeteoDisplayed,
    isDistanceDisplayed,
    isRegroupementDisplayed,
    ...otherParams
  } = configurationToSave;

  // We deconstruct the structured UI model and transform it into the DB ready model
  // although still with the UI name as key
  const uiFlatMapping = {
    defaultAge: defaultAge.id,
    defaultDepartement: defaultDepartement.id,
    defaultEstimationNombre: defaultEstimationNombre.id,
    defaultObservateur: defaultObservateur.id,
    defaultSexe: defaultSexe.id,
    areAssociesDisplayed: areAssociesDisplayed ? "1" : "0",
    isMeteoDisplayed: isMeteoDisplayed ? "1" : "0",
    isDistanceDisplayed: isDistanceDisplayed ? "1" : "0",
    isRegroupementDisplayed: isRegroupementDisplayed ? "1" : "0",
    ...otherParams
  };

  // Here we create the mapping between the DB name and its DB value, that has been already transformed above
  const whereSetValueMapping: { [key: string]: string | number } = {};
  _.forEach(uiFlatMapping, (value: number | string, key: string) => {
    const dbKeyWhere = _.findKey(DB_CONFIGURATION_MAPPING, (valueUi) => {
      return valueUi === key;
    });
    whereSetValueMapping[dbKeyWhere] = value;
  });

  const result = await SqlConnection.query(
    updateAllInTableQuery(
      TABLE_CONFIGURATION,
      "value",
      "libelle",
      whereSetValueMapping
    )
  );
  return result;
};
