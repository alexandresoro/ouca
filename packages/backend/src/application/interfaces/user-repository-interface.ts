import { type User } from "@domain/user/user.js";
import { type DatabaseTransactionConnection } from "slonik";

export type UserRepository = {
  getUserInfoById: (userId: string) => Promise<User | null>;
  findUserByExternalId: ({
    externalProviderName,
    externalUserId,
  }: { externalProviderName: string; externalUserId: string }) => Promise<User | null>;
  createUser: (
    create: {
      ext_provider_name: string;
      ext_provider_id: string;
    },
    transaction?: DatabaseTransactionConnection
  ) => Promise<User>;
  deleteUserById: (userId: string) => Promise<boolean>;
};
