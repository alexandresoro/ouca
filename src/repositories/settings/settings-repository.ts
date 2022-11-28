import { type DatabasePool } from "slonik";

export type SettingsRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildSettingsRepository = ({ slonik }: SettingsRepositoryDependencies) => {
  return {};
};

export type SettingsRepository = ReturnType<typeof buildSettingsRepository>;
