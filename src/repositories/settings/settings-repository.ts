import { sql, type DatabasePool, type DatabaseTransactionConnection } from "slonik";
import { z } from "zod";
import { settingsSchema, type Settings } from "./settings-repository-types";

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
    createDefaultSettings,
  };
};

export type SettingsRepository = ReturnType<typeof buildSettingsRepository>;
