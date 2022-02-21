import { DatabaseRole, User } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import { EditUserData, UserCreateInput, UserLoginInput } from "../model/graphql";
import prisma from "../sql/prisma";
import { SALT_AND_PWD_DELIMITER } from "../utils/keys";

const PASSWORD_KEY_LENGTH = 64;

// Make sure that the password is properly encrypted :-)
const getHashedPassword = (plaintextPassword: string): string => {
  const salt = randomBytes(16);
  const encryptedPasswordBuffer = scryptSync(plaintextPassword, salt, PASSWORD_KEY_LENGTH);

  return `${salt.toString("hex")}${SALT_AND_PWD_DELIMITER}${encryptedPasswordBuffer.toString("hex")}`;
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
    return Promise.reject("No matching user has been found");
  }

  // Check that the password matches
  const [saltAsHex, storedSaltedPassword] = matchingUser.password.split(SALT_AND_PWD_DELIMITER);
  const inputSaltedPassword = scryptSync(password, Buffer.from(saltAsHex, "hex"), PASSWORD_KEY_LENGTH).toString("hex");

  if (inputSaltedPassword !== storedSaltedPassword) {
    return Promise.reject("The provided password is incorrect");
  }

  const { password: userPassword, ...userInfo } = matchingUser;

  return userInfo;
};

export const updateUser = async (userId: string, userUpdate: EditUserData): Promise<Omit<User, "password">> => {
  const { currentPassword, newPassword, ...restUserUpdate } = userUpdate;

  // Try to find the matching profile
  const matchingUser = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!matchingUser) {
    return Promise.reject("No matching user has been found");
  }

  // Check that the password matches
  const [saltAsHex, storedSaltedPassword] = matchingUser.password.split(SALT_AND_PWD_DELIMITER);
  const inputSaltedPassword = scryptSync(currentPassword, Buffer.from(saltAsHex, "hex"), PASSWORD_KEY_LENGTH).toString(
    "hex"
  );

  if (inputSaltedPassword !== storedSaltedPassword) {
    return Promise.reject("The provided password is incorrect");
  }

  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      ...restUserUpdate,
      password: newPassword ? getHashedPassword(newPassword) : undefined
    }
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  await prisma.user.delete({
    where: {
      id: userId
    }
  });
};

export const getUsersCount = async (): Promise<number> => {
  return prisma.user.count();
};
