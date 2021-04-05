import { HttpParameters } from "../http/httpParameters";
import { AppConfiguration } from "../model/types/app-configuration.object";
import { findAppConfiguration, persistUserSettings } from "../sql-api/sql-api-configuration";

export const getAppConfiguration = async (): Promise<AppConfiguration> => {
  return await findAppConfiguration();
};

export const configurationUpdate = async (
  httpParameters: HttpParameters<AppConfiguration>
): Promise<boolean> => {
  const appConfiguration = httpParameters.postData;
  return await persistUserSettings(appConfiguration);
};
