import { CoordinatesSystemType } from "../model/coordinates-system/coordinates-system.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { TABLE_SETTINGS } from "../utils/constants";
import { getFirstResult, query } from "./sql-queries-utils";

export const queryToCreateSettingsTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS settings (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " default_observateur_id SMALLINT(5) UNSIGNED NULL," +
    " default_departement_id SMALLINT(5) UNSIGNED NULL," +
    " default_age_id SMALLINT(5) UNSIGNED NULL," +
    " default_sexe_id SMALLINT(5) UNSIGNED NULL," +
    " default_estimation_nombre_id SMALLINT(5) UNSIGNED NULL," +
    " default_nombre SMALLINT(5) UNSIGNED NULL," +
    " are_associes_displayed bit(1) NOT NULL DEFAULT 1," +
    " is_meteo_displayed bit(1) NOT NULL DEFAULT 1," +
    " is_distance_displayed bit(1) NOT NULL DEFAULT 1," +
    " is_regroupement_displayed bit(1) NOT NULL DEFAULT 1," +
    " coordinates_system VARCHAR(20) NOT NULL DEFAULT \"gps\"," +
    " PRIMARY KEY (id)," +
    " CONSTRAINT `fk_settings_observateur_id` FOREIGN KEY (default_observateur_id) REFERENCES observateur (id) ON DELETE SET NULL," +
    " CONSTRAINT `fk_settings_departement_id` FOREIGN KEY (default_departement_id) REFERENCES departement (id) ON DELETE SET NULL," +
    " CONSTRAINT `fk_settings_age_id` FOREIGN KEY (default_age_id) REFERENCES age (id) ON DELETE SET NULL," +
    " CONSTRAINT `fk_settings_sexe_id` FOREIGN KEY (default_sexe_id) REFERENCES sexe (id) ON DELETE SET NULL," +
    " CONSTRAINT `fk_settings_estimation_nombre_id` FOREIGN KEY (default_estimation_nombre_id) REFERENCES estimation_nombre (id) ON DELETE SET NULL" +
    " )");
}

export const queryToInitializeSettingsTable = async (): Promise<SqlSaveResponse> => {
  return query<SqlSaveResponse>("INSERT INTO basenaturaliste.settings VALUES()");
}

export const queryToFindCoordinatesSystem = async (): Promise<CoordinatesSystemType
> => {
  const results = await query<{ system: CoordinatesSystemType }[]>(
    `SELECT coordinates_system as system FROM ${TABLE_SETTINGS}`
  );
  return getFirstResult(results)?.system ? getFirstResult(results).system : null;
};
