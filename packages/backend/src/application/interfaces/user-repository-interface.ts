import type { User } from "@domain/user/user.js";

export type UserRepository = {
  getUserInfoById: (userId: string) => Promise<User | null>;
  findUserByExternalId: ({
    externalProviderName,
    externalUserId,
  }: { externalProviderName: string; externalUserId: string }) => Promise<User | null>;
  updateUserSettings: (id: string, settings: User["settings"]) => Promise<User>;
  createUser: (create: {
    extProviderName: string;
    extProviderId: string;
  }) => Promise<User>;
  deleteUserById: (userId: string) => Promise<boolean>;
};
