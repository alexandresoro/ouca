import { DatabaseRole, User } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import type { CamelCasedProperties, Except } from "type-fest";
import { EditUserData, UserCreateInput } from "../graphql/generated/graphql-types";
import { type UserRepository } from "../repositories/user/user-repository";
import { type FindByUserNameResult, type UserInfo } from "../repositories/user/user-repository-types";
import prisma from "../sql/prisma";
import { LoggedUser } from "../types/LoggedUser";
import { OucaError } from "../utils/errors";
import { SALT_AND_PWD_DELIMITER } from "../utils/keys";
import { logger } from "../utils/logger";
import options from "../utils/options";

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
  userRepository: UserRepository;
};

export const buildUserService = ({ userRepository }: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<UserInfo | null> => {
    return userRepository.getUserInfoById(userId);
  };

  const loginUser = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<CamelCasedProperties<Except<FindByUserNameResult, "password">>> => {
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

  const deleteUser = async (userId: string, loggedUser: LoggedUser): Promise<boolean> => {
    // Only a user can delete itself
    // With admin role, admin can delete anyone
    if (loggedUser.id === userId || loggedUser.role === DatabaseRole.admin) {
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
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;

export const createUser = async (
  signupData: UserCreateInput,
  role: DatabaseRole,
  loggedUser: LoggedUser | null
): Promise<Omit<User, "password">> => {
  if (!options.admin.signupsAllowed) {
    throw new OucaError("OUCA0005");
  }

  const { password, ...otherUserInfo } = signupData;

  // Only an administrator can create new accounts
  // Except when no admin accounts at all exist:
  // In that case, the first created account is an admin but needs to provide the correct password
  const adminsCount = await prisma.user.count({
    where: {
      role: DatabaseRole.admin,
    },
  });

  let roleToSet = role;
  if (adminsCount === 0) {
    // Initial account creation
    // Check that provided password matches
    if (!options.admin.defaultAdminPassword?.length || password !== options.admin.defaultAdminPassword) {
      throw new OucaError("OUCA0006");
    }
    roleToSet = DatabaseRole.admin;
  } else {
    // Check that the user requesting the account creation is authorized
    if (loggedUser?.role !== DatabaseRole.admin) {
      throw new OucaError("OUCA0007");
    }
  }

  const createdUser = await prisma.user.create({
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    data: {
      ...otherUserInfo,
      role: roleToSet,
      password: getHashedPassword(password),
      Settings: {
        create: {},
      },
    },
  });

  if (createdUser) {
    logger.info(`User ${createdUser.username} has been created`);
  }

  return createdUser;
};

export const updateUser = async (
  userId: string,
  userUpdate: EditUserData,
  loggedUser: LoggedUser
): Promise<Omit<User, "password">> => {
  // Only a user can delete itself
  // With admin role, admin can edit anyone
  if (loggedUser.id === userId || loggedUser.role === DatabaseRole.admin) {
    // Try to find the matching profile
    const matchingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!matchingUser) {
      return Promise.reject(new OucaError("OUCA0002"));
    }

    const { currentPassword, newPassword, ...restUserUpdate } = userUpdate;

    // Check that the password matches
    if (!validatePassword(currentPassword, matchingUser.password) && loggedUser.role !== DatabaseRole.admin) {
      return Promise.reject(new OucaError("OUCA0003"));
    }

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: restUserUpdate.firstName ?? undefined,
        lastName: restUserUpdate.lastName ?? undefined,
        username: restUserUpdate.username ?? undefined,
        password: newPassword ? getHashedPassword(newPassword) : undefined,
      },
    });
  } else {
    return Promise.reject(new OucaError("OUCA0001"));
  }
};
