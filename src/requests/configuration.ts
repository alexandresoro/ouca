import { ConfigurationPage } from "basenaturaliste-model/configuration-page.object";
import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters.js";
import configurationInitMock from "../mocks/configuration-page/configuration.json";

export const configurationInit = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<ConfigurationPage> => {
  if (isMockDatabaseMode) {
    return configurationInitMock as any;
  } else {
    // TODO
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
