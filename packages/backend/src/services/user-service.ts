import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import config from "../config.js";
import { type UserCreateInput } from "../graphql/generated/graphql-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type UserRepository } from "../repositories/user/user-repository.js";
import { type LoggedUser, type UserRole } from "../types/User.js";
import { OucaError } from "../utils/errors.js";

type UserServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  userRepository: UserRepository;
  settingsRepository: SettingsRepository;
};

export const buildUserService = ({ logger, slonik, userRepository, settingsRepository }: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<LoggedUser | null> => {
    const user = await userRepository.getUserInfoById(userId);

    if (!user) {
      return null;
    }

    return user;
  };

  const createUser = async (
    signupData: UserCreateInput,
    role: UserRole,
    loggedUser: LoggedUser | null
  ): Promise<LoggedUser> => {
    if (!config.admin.signupsAllowed) {
      throw new OucaError("OUCA0005");
    }

    const { password, ...otherUserInfo } = signupData;

    // Only an administrator can create new accounts
    // Except when no admin accounts at all exist:
    // In that case, the first created account is an admin but needs to provide the correct password
    const adminsCount = await userRepository.getAdminsCount();

    let roleToSet = role;
    if (adminsCount === 0) {
      // Initial account creation
      // Check that provided password matches
      if (!config.admin.defaultAdminPassword?.length || password !== config.admin.defaultAdminPassword) {
        throw new OucaError("OUCA0006");
      }
      roleToSet = "admin";
    } else {
      // Check that the user requesting the account creation is authorized
      if (loggedUser?.role !== "admin") {
        throw new OucaError("OUCA0007");
      }
    }

    const createdUser = await slonik.transaction(async (transactionConnction) => {
      const createdUserQueryResult = await userRepository.createUser(
        {
          first_name: otherUserInfo.firstName,
          last_name: otherUserInfo.lastName ?? undefined,
          username: otherUserInfo.username,
          role: roleToSet,
        },
        transactionConnction
      );

      await settingsRepository.createDefaultSettings(createdUserQueryResult.id, transactionConnction);

      return createdUserQueryResult;
    });

    return createdUser;
  };

  const deleteUser = async (userId: string, loggedUser: LoggedUser): Promise<boolean> => {
    // Only a user can delete itself
    // With admin role, admin can delete anyone
    if (loggedUser.id === userId || loggedUser.role === "admin") {
      const isSuccess = await userRepository.deleteUserById(userId);

      if (isSuccess) {
        logger.info(`User with id ${userId} has been deleted. Request has been initiated by ID ${loggedUser.id}`);
      }

      return isSuccess;
    } else {
      return Promise.reject(new OucaError("OUCA0001"));
    }
  };

  return {
    getUser,
    createUser,
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
