import { sql, type DatabasePool, type DatabaseTransactionConnection } from "slonik";
import { z } from "zod";
import { objectToKeyValueSet } from "../repository-helpers.js";
import { settingsSchema, type Settings, type UpdateSettingsInput } from "./settings-repository-types.js";

export type SettingsRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildSettingsRepository = ({ slonik }: SettingsRepositoryDependencies) => {
  const getUserSettings = async (userId: string): Promise<Settings | null> => {
    const query = sql.type(settingsSchema)`
      SELECT
        id::text,
        default_observateur_id::text,
        default_departement_id::text,
        default_age_id::text,
        default_sexe_id::text,
        default_estimation_nombre_id::text,
        default_nombre,
        are_associes_displayed,
        is_meteo_displayed,
        is_distance_displayed,
        is_regroupement_displayed,
        coordinates_system,
        user_id
      FROM
        basenaturaliste.settings
      WHERE
        user_id = ${userId}
    `;

    return slonik.maybeOne(query);
  };

  const updateUserSettings = async (user_id: string, updateSettingsInput: UpdateSettingsInput): Promise<Settings> => {
    const query = sql.type(settingsSchema)`
      UPDATE
        basenaturaliste.settings
      SET
      ${objectToKeyValueSet(updateSettingsInput)}
      WHERE
        user_id = ${user_id}
      RETURNING
        id::text,
        default_observateur_id::text,
        default_departement_id::text,
        default_age_id::text,
        default_sexe_id::text,
        default_estimation_nombre_id::text,
        default_nombre,
        are_associes_displayed,
        is_meteo_displayed,
        is_distance_displayed,
        is_regroupement_displayed,
        coordinates_system,
        user_id
    `;

    return slonik.one(query);
  };

  const createDefaultSettings = async (userId: string, transaction?: DatabaseTransactionConnection): Promise<void> => {
    const query = sql.type(z.void())`
      INSERT INTO
        basenaturaliste.settings
        (user_id)
      VALUES
        (${userId})
    `;

    await (transaction ?? slonik).query(query);
  };

  return {
    getUserSettings,
    updateUserSettings,
    createDefaultSettings,
  };
};

export type SettingsRepository = ReturnType<typeof buildSettingsRepository>;
