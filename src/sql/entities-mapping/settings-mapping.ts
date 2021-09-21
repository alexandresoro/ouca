import { Age, Departement, EstimationNombre, Observateur, Settings as SettingsDb, Sexe } from "@prisma/client";
import { InputSettings, Settings } from "../../model/graphql";

export const buildSettingsFromSettingsDb = (
  settings: SettingsDb & {
    observateur: Observateur;
    departement: Departement;
    age: Age;
    sexe: Sexe;
    estimation_nombre: EstimationNombre;
  }
): Settings => {

  const { non_compte, ...otherFieldsEstimationNombre } = settings.estimation_nombre;

  return {
    id: settings.id,
    defaultObservateur: settings.observateur,
    defaultDepartement: settings.departement,
    defaultAge: settings.age,
    defaultSexe: settings.sexe,
    defaultEstimationNombre: { ...otherFieldsEstimationNombre, nonCompte: non_compte },
    defaultNombre: settings.default_nombre,
    areAssociesDisplayed: settings.are_associes_displayed,
    isMeteoDisplayed: settings.is_meteo_displayed,
    isDistanceDisplayed: settings.is_distance_displayed,
    isRegroupementDisplayed: settings.is_regroupement_displayed,
    coordinatesSystem: settings.coordinates_system
  };
};

export const buildSettingsDbFromInputSettings = (
  appConfiguration: InputSettings
): SettingsDb => {
  return {
    id: appConfiguration.id,
    default_observateur_id: appConfiguration.defaultObservateur,
    default_departement_id: appConfiguration.defaultDepartement,
    default_age_id: appConfiguration.defaultAge,
    default_sexe_id: appConfiguration.defaultSexe,
    default_estimation_nombre_id: appConfiguration.defaultEstimationNombre,
    default_nombre: appConfiguration.defaultNombre,
    are_associes_displayed: appConfiguration.areAssociesDisplayed,
    is_meteo_displayed: appConfiguration.isMeteoDisplayed,
    is_distance_displayed: appConfiguration.isDistanceDisplayed,
    is_regroupement_displayed: appConfiguration.isRegroupementDisplayed,
    coordinates_system: appConfiguration.coordinatesSystem,
    user_id: undefined // TODO handle multi users someday
  };
};
