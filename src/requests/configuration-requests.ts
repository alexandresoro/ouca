import { HttpParameters } from "../http/httpParameters";
import { AppConfiguration } from "../model/types/app-configuration.object";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";

export const getAppConfigurationRequest = async (): Promise<AppConfiguration> => {
  return await findAppConfiguration();
};

export const configurationUpdateRequest = async (
  httpParameters: HttpParameters<AppConfiguration>
): Promise<boolean> => {
  return await persistUserSettings(httpParameters.body);
};
