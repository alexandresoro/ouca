import { ConfigurationPage } from "basenaturaliste-model/configuration-page.object";
import * as _ from "lodash";
import * as mysql from "mysql";
import configurationInitMock from "../mocks/configuration-page/configuration.json";

export function configurationInit(
  isMockDatabaseMode: boolean,
  callbackFn: (errors: mysql.MysqlError, result: ConfigurationPage) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, configurationInitMock as any);
  } else {
    // TODO
  }
}
