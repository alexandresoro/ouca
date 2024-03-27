import { type Settings, type UpdateSettingsInput, settingsSchema } from "@domain/settings/settings.js";
import { type Database, kysely } from "@infrastructure/kysely/kysely.js";
import { type Transaction, sql } from "kysely";

const getUserSettings = async (userId: string): Promise<Settings | null> => {
  const userSettings = await kysely
    .selectFrom("settings")
    .select([
      sql`id::text`.as("id"),
      sql`default_observateur_id::text`.as("default_observateur_id"),
      sql`default_departement_id::text`.as("default_departement_id"),
      sql`default_age_id::text`.as("default_age_id"),
      sql`default_sexe_id::text`.as("default_sexe_id"),
      sql`default_estimation_nombre_id::text`.as("default_estimation_nombre_id"),
      "defaultNombre",
      "areAssociesDisplayed",
      "isMeteoDisplayed",
      "isDistanceDisplayed",
      "isRegroupementDisplayed",
      "userId",
    ])
    .where("userId", "=", userId)
    .executeTakeFirst();

  return userSettings ? settingsSchema.parse(userSettings) : null;
};

const createDefaultSettings = async (userId: string, transaction?: Transaction<Database>): Promise<void> => {
  await (transaction ?? kysely)
    .insertInto("settings")
    .values({
      userId,
    })
    .execute();
};

const updateUserSettings = async (userId: string, updateSettingsInput: UpdateSettingsInput): Promise<Settings> => {
  const updatedUserResult = await kysely
    .updateTable("settings")
    .set(updateSettingsInput)
    .where("userId", "=", userId)
    .returning([
      sql`id::text`.as("id"),
      sql`default_observateur_id::text`.as("default_observateur_id"),
      sql`default_departement_id::text`.as("default_departement_id"),
      sql`default_age_id::text`.as("default_age_id"),
      sql`default_sexe_id::text`.as("default_sexe_id"),
      sql`default_estimation_nombre_id::text`.as("default_estimation_nombre_id"),
      "defaultNombre",
      "areAssociesDisplayed",
      "isMeteoDisplayed",
      "isDistanceDisplayed",
      "isRegroupementDisplayed",
      "userId",
    ])
    .executeTakeFirstOrThrow();

  return settingsSchema.parse(updatedUserResult);
};

export const settingsRepository = {
  getUserSettings,
  createDefaultSettings,
  updateUserSettings,
};
