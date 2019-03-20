import { ConfigurationPage } from "basenaturaliste-model/configuration-page.object";
import * as _ from "lodash";
import * as mysql from "mysql";
import { HttpParameters } from "../http/httpParameters.js";
import configurationInitMock from "../mocks/configuration-page/configuration.json";

export function configurationInit(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: ConfigurationPage) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, configurationInitMock as any);
  } else {
    // TODO
  }
}

export function configurationUpdate(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: ConfigurationPage) => void
) {
  if (isMockDatabaseMode) {
    // callbackFn(null, configurationInitMock as any);
  } else {
    // TODO
  }
}
