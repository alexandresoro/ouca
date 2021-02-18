import { AppConfiguration } from "@ou-ca/ouca-model";
import { HttpParameters } from "../http/httpParameters";
import { findAppConfiguration, persistUserSettings } from "../sql-api/sql-api-configuration";

export const getAppConfiguration = async (): Promise<AppConfiguration> => {
  return await findAppConfiguration();
};

export const configurationUpdate = async (
  httpParameters: HttpParameters
): Promise<boolean> => {
  const appConfiguration: AppConfiguration = httpParameters.postData;
  return await persistUserSettings(appConfiguration);
};
