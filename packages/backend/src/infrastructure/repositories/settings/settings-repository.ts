import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { settingsSchema, type Settings } from "./settings-repository-types.js";

export const buildSettingsRepository = () => {
  const getUserSettings = async (userId: string): Promise<Settings | null> => {
    const userSettings = await kysely
      .selectFrom("basenaturaliste.settings")
      .select([
        sql`id::text`.as("id"),
        sql`default_observateur_id::text`.as("default_observateur_id"),
        sql`default_departement_id::text`.as("default_departement_id"),
        sql`default_age_id::text`.as("default_age_id"),
        sql`default_sexe_id::text`.as("default_sexe_id"),
        sql`default_estimation_nombre_id::text`.as("default_estimation_nombre_id"),
        "default_nombre",
        "are_associes_displayed",
        "is_meteo_displayed",
        "is_distance_displayed",
        "is_regroupement_displayed",
        "user_id",
      ])
      .where("user_id", "=", userId)
      .executeTakeFirstOrThrow();

    return settingsSchema.parse(userSettings);
  };

  return {
    getUserSettings,
  };
};

export type SettingsRepository = ReturnType<typeof buildSettingsRepository>;
