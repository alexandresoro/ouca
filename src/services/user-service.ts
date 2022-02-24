import { DatabaseRole, User } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import { EditUserData, UserCreateInput, UserLoginInput } from "../model/graphql";
import prisma from "../sql/prisma";
import { OucaError } from "../utils/errors";
import { SALT_AND_PWD_DELIMITER } from "../utils/keys";
import { logger } from "../utils/logger";
import { LoggedUser } from "../utils/user";

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

export const getUser = async (userId: string): Promise<Omit<User, "password"> | null> => {
  return prisma.user.findUnique({
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true
    },
    where: {
      id: userId
    }
  });
};

export const createUser = async (signupData: UserCreateInput, role: DatabaseRole): Promise<Omit<User, "password">> => {
  const { password, ...otherUserInfo } = signupData;

  return prisma.user.create({
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true
    },
    data: {
      ...otherUserInfo,
      role,
      password: getHashedPassword(password)
    }
  });
};

export const loginUser = async (loginData: UserLoginInput): Promise<Omit<User, "password">> => {
  const { username, password } = loginData;

  // Try to find the matching profile
  const matchingUser = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!matchingUser) {
    return Promise.reject(new OucaError("OUCA0002"));
  }

  // Check that the password matches
  if (!validatePassword(password, matchingUser.password)) {
    return Promise.reject(new OucaError("OUCA0003"));
  }

  const { password: userPassword, ...userInfo } = matchingUser;

  return userInfo;
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
        id: userId
      }
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
        id: userId
      },
      data: {
        firstName: restUserUpdate.firstName ?? undefined,
        lastName: restUserUpdate.lastName ?? undefined,
        username: restUserUpdate.username ?? undefined,
        password: newPassword ? getHashedPassword(newPassword) : undefined
      }
    });
  } else {
    return Promise.reject(new OucaError("OUCA0001"));
  }
};

export const deleteUser = async (userId: string, loggedUser: LoggedUser): Promise<void> => {
  // Only a user can delete itself
  // With admin role, admin can delete anyone
  if (loggedUser.id === userId || loggedUser.role === DatabaseRole.admin) {
    await prisma.user.delete({
      where: {
        id: userId
      }
    });

    logger.info(`User with id ${userId} has been deleted. Request has been initiated by ID ${loggedUser.id}`);
  } else {
    return Promise.reject(new OucaError("OUCA0001"));
  }
};

export const getUsersCount = async (): Promise<number> => {
  return prisma.user.count();
};
