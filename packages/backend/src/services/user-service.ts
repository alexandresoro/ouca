import { randomBytes, scryptSync } from "node:crypto";
import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import type { CamelCasedProperties, Except } from "type-fest";
import config from "../config.js";
import { type EditUserData, type UserCreateInput } from "../graphql/generated/graphql-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type UserRepository } from "../repositories/user/user-repository.js";
import { type DatabaseRole, type LoggedUser, type User } from "../types/User.js";
import { OucaError } from "../utils/errors.js";
import { SALT_AND_PWD_DELIMITER } from "../utils/keys.js";

const PASSWORD_KEY_LENGTH = 64;

// Make sure that the password is properly encrypted :-)
export const getHashedPassword = (plaintextPassword: string): string => {
  const salt = randomBytes(16);
  const encryptedPasswordBuffer = scryptSync(plaintextPassword, salt, PASSWORD_KEY_LENGTH);

  return `${salt.toString("hex")}${SALT_AND_PWD_DELIMITER}${encryptedPasswordBuffer.toString("hex")}`;
};

export const validatePassword = (password: string | null | undefined, hashedPasswordWithSalt: string): boolean => {
  if (!password) {
    return false;
  }

  const [saltAsHex, storedSaltedPassword] = hashedPasswordWithSalt.split(SALT_AND_PWD_DELIMITER);
  const inputSaltedPassword = scryptSync(password, Buffer.from(saltAsHex, "hex"), PASSWORD_KEY_LENGTH).toString("hex");

  return storedSaltedPassword === inputSaltedPassword;
};

type UserServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  userRepository: UserRepository;
  settingsRepository: SettingsRepository;
};

export const buildUserService = ({ logger, slonik, userRepository, settingsRepository }: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<User | null> => {
    const userWithPassword = await userRepository.getUserInfoById(userId);

    if (!userWithPassword) {
      return null;
    }

    const { password, ...user } = userWithPassword;
    return user;
  };

  const loginUser = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<Except<CamelCasedProperties<User>, "password">> => {
    // Try to find the matching profile
    const matchingUser = await userRepository.findUserByUsername(username);

    if (!matchingUser) {
      return Promise.reject(new OucaError("OUCA0002"));
    }

    // Check that the password matches
    if (!validatePassword(password, matchingUser.password)) {
      return Promise.reject(new OucaError("OUCA0003"));
    }

    const { password: userPassword, ...userInfo } = matchingUser;

    return {
      ...userInfo,
    };
  };

  const createUser = async (
    signupData: UserCreateInput,
    role: DatabaseRole,
    loggedUser: LoggedUser | null
  ): Promise<User> => {
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
          password: getHashedPassword(password),
          username: otherUserInfo.username,
          role: roleToSet,
        },
        transactionConnction
      );

      await settingsRepository.createDefaultSettings(createdUserQueryResult.id, transactionConnction);

      return createdUserQueryResult;
    });

    if (createdUser) {
      logger.info(`User ${createdUser.username} has been created`);
    }

    const { password: createdUserPassword, ...user } = createdUser;

    return user;
  };

  const updateUser = async (userId: string, userUpdate: EditUserData, loggedUser: LoggedUser): Promise<User> => {
    // Only a user can delete itself
    // With admin role, admin can edit anyone
    if (loggedUser.id === userId || loggedUser.role === "admin") {
      // Try to find the matching profile
      const matchingUser = await userRepository.getUserInfoById(userId);

      if (!matchingUser) {
        return Promise.reject(new OucaError("OUCA0002"));
      }

      const { currentPassword, newPassword, ...restUserUpdate } = userUpdate;

      // Check that the password matches
      if (!validatePassword(currentPassword, matchingUser.password) && loggedUser.role !== "admin") {
        return Promise.reject(new OucaError("OUCA0003"));
      }

      const { password, ...updatedUser } = await userRepository.updateUser(userId, {
        first_name: restUserUpdate.firstName ?? undefined,
        last_name: restUserUpdate.lastName ?? undefined,
        username: restUserUpdate.username ?? undefined,
        password: newPassword ? getHashedPassword(newPassword) : undefined,
      });

      return updatedUser;
    } else {
      return Promise.reject(new OucaError("OUCA0001"));
    }
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
    loginUser,
    createUser,
    updateUser,
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
