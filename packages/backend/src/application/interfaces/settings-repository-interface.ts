import { type Settings, type UpdateSettingsInput } from "@domain/settings/settings.js";

export type SettingsRepository = {
  getUserSettings: (userId: string) => Promise<Settings | null>;
  updateUserSettings: (userId: string, updateSettingsInput: UpdateSettingsInput) => Promise<Settings>;
};
