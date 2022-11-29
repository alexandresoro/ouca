import { sql, type DatabasePool, type DatabaseTransactionConnection } from "slonik";
import { z } from "zod";

export type SettingsRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildSettingsRepository = ({ slonik }: SettingsRepositoryDependencies) => {
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
    createDefaultSettings,
  };
};

export type SettingsRepository = ReturnType<typeof buildSettingsRepository>;
