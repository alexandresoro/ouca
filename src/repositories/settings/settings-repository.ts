import { sql, type DatabasePool, type DatabaseTransactionConnection } from "slonik";
import { z } from "zod";
import { objectToKeyValueSet } from "../../utils/slonik-utils";
import { settingsSchema, type Settings, type UpdateSettingsInput } from "./settings-repository-types";

export type SettingsRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildSettingsRepository = ({ slonik }: SettingsRepositoryDependencies) => {
  const getUserSettings = async (userId: string): Promise<Settings | null> => {
    const query = sql.type(settingsSchema)`
      SELECT
        *
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
        *
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
