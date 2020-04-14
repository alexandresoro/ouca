/* eslint-disable @typescript-eslint/camelcase */
import { AppConfiguration } from "ouca-common/app-configuration.object";
import { EntiteSimple } from "ouca-common/entite-simple.object";
import { SettingsDb } from "../objects/db/settings-db.object";

const getSettingAsEntity = <T extends EntiteSimple>(
  entityId: number,
  entities: any[]
): T => {
  if (!entityId || !entities) {
    return null;
  }

  return entities.find((entity) => entity.id === entityId);
};

export const buildAppConfigurationFromSettingsDb = (
  settings: SettingsDb,
  observateurs: any[],
  departements: any[],
  ages: any[],
  sexes: any[],
  estimationsNombre: any[]
): AppConfiguration => {
  const appConfiguration: AppConfiguration = {
    defaultObservateur: getSettingAsEntity(
      settings.default_observateur_id,
      observateurs
    ),
    defaultDepartement: getSettingAsEntity(
      settings.default_departement_id,
      departements
    ),
    defaultAge: getSettingAsEntity(settings.default_age_id, ages),
    defaultSexe: getSettingAsEntity(settings.default_sexe_id, sexes),
    defaultEstimationNombre: getSettingAsEntity(
      settings.default_estimation_nombre_id,
      estimationsNombre
    ),
    defaultNombre: settings.default_nombre,
    areAssociesDisplayed: settings.are_associes_displayed,
    isMeteoDisplayed: settings.is_meteo_displayed,
    isDistanceDisplayed: settings.is_distance_displayed,
    isRegroupementDisplayed: settings.is_regroupement_displayed,
    coordinatesSystem: settings.coordinates_system,
  };

  return appConfiguration;
};

export const buildSettingsDbFromAppConfiguration = (
  appConfiguration: AppConfiguration
): SettingsDb => {
  return {
    id: 1, // TODO
    default_observateur_id: appConfiguration.defaultObservateur?.id,
    default_departement_id: appConfiguration.defaultDepartement?.id,
    default_age_id: appConfiguration.defaultAge?.id,
    default_sexe_id: appConfiguration.defaultSexe?.id,
    default_estimation_nombre_id: appConfiguration.defaultEstimationNombre?.id,
    default_nombre: appConfiguration.defaultNombre,
    are_associes_displayed: appConfiguration.areAssociesDisplayed,
    is_meteo_displayed: appConfiguration.isMeteoDisplayed,
    is_distance_displayed: appConfiguration.isDistanceDisplayed,
    is_regroupement_displayed: appConfiguration.isRegroupementDisplayed,
    coordinates_system: appConfiguration.coordinatesSystem,
  };
};
