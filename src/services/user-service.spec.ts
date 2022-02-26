import { DatabaseRole } from "@prisma/client";
import { EditUserData, UserLoginInput } from "../model/graphql";
import { prismaMock } from "../sql/prisma-mock";
import { LoggedUser } from "../types/LoggedUser";
import { OucaError } from "../utils/errors";
import { logger } from "../utils/logger";
import { deleteUser, getHashedPassword, loginUser, updateUser, validatePassword } from "./user-service";

beforeAll(() => {
  logger.level = "silent";
});

test("should validate correct password", () => {
  const password = "mysupersafepassw0rd!";

  const hashedPassword = getHashedPassword(password);

  expect(validatePassword(password, hashedPassword)).toBe(true);
});

test("should not validate incorrect password", () => {
  const password = "mysupersafepassw0rd!";

  const hashedPassword = getHashedPassword(password);

  expect(validatePassword("anotherpassword", hashedPassword)).toBe(false);
});

test("should not validate nil password", () => {
  const password = "mysupersafepassw0rd!";

  const hashedPassword = getHashedPassword(password);

  expect(validatePassword(undefined, hashedPassword)).toBe(false);
});

test("should rejects when log in with unknown account", async () => {
  const loginData: UserLoginInput = {
    username: "bob",
    password: "toto"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce(null);

  await expect(loginUser(loginData)).rejects.toEqual(new OucaError("OUCA0002"));
});

test("should rejects when log in with incorrect password", async () => {
  const correctPassword = "mysupersafepassw0rd!";
  const hashedPassword = getHashedPassword(correctPassword);

  const loginData: UserLoginInput = {
    username: "bob",
    password: "toto"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: "12",
    username: "bob",
    password: hashedPassword,
    role: DatabaseRole.contributor,
    firstName: "bob",
    lastName: "by"
  });

  await expect(loginUser(loginData)).rejects.toEqual(new OucaError("OUCA0003"));
});

test("should return userinfo when log in correctly", async () => {
  const correctPassword = "mysupersafepassw0rd!";
  const hashedPassword = getHashedPassword(correctPassword);

  const loginData: UserLoginInput = {
    username: "bob",
    password: correctPassword
  };

  const userInfoComplete = {
    id: "12",
    username: "bob",
    password: hashedPassword,
    role: DatabaseRole.contributor,
    firstName: "bob",
    lastName: "by"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce(userInfoComplete);

  const { password, ...userInfo } = userInfoComplete;
  await expect(loginUser(loginData)).resolves.toEqual(userInfo);
});

test("should be able to edit itself", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  const correctPassword = "mysupersafepassw0rd!";
  const hashedPassword = getHashedPassword(correctPassword);

  const editUserData: EditUserData = {
    currentPassword: correctPassword,
    newPassword: "xd"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: "12",
    username: "bob",
    password: hashedPassword,
    role: DatabaseRole.contributor,
    firstName: "bob",
    lastName: "by"
  });

  await updateUser("12", editUserData, loggedUser);

  expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
});

test("should not be able to edit an non existing user", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  const editUserData: EditUserData = {
    currentPassword: "lol",
    newPassword: "xd"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce(null);

  await expect(updateUser("12", editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0002"));

  expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
});

test("should not be able to edit when incorrect password provided", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  const correctPassword = "mysupersafepassw0rd!";
  const hashedPassword = getHashedPassword(correctPassword);

  const editUserData: EditUserData = {
    currentPassword: "lol",
    newPassword: "xd"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: "12",
    username: "bob",
    password: hashedPassword,
    role: DatabaseRole.contributor,
    firstName: "bob",
    lastName: "by"
  });

  await expect(updateUser("12", editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0003"));

  expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
});

test("should not be able to edit when password missing", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  const correctPassword = "mysupersafepassw0rd!";
  const hashedPassword = getHashedPassword(correctPassword);

  const editUserData: EditUserData = {
    newPassword: "xd"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: "12",
    username: "bob",
    password: hashedPassword,
    role: DatabaseRole.contributor,
    firstName: "bob",
    lastName: "by"
  });

  await expect(updateUser("12", editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0003"));

  expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
});

test("should be able to edit another user if admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.admin
  };

  const correctPassword = "mysupersafepassw0rd!";
  const hashedPassword = getHashedPassword(correctPassword);

  const editUserData: EditUserData = {
    lastName: "xd"
  };

  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: "12",
    username: "bob",
    password: hashedPassword,
    role: DatabaseRole.contributor,
    firstName: "bob",
    lastName: "by"
  });

  await updateUser("11", editUserData, loggedUser);

  expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
});

test("should return an error when editing another user as non-admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  const editUserData: EditUserData = {
    currentPassword: "lol",
    newPassword: "xd"
  };

  await expect(updateUser("11", editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
});

test("should be able to delete itself", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  await deleteUser("12", loggedUser);

  expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.user.delete).toHaveBeenLastCalledWith({
    where: {
      id: "12"
    }
  });
});

test("should be able delete to another user if admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.admin
  };

  await deleteUser("11", loggedUser);

  expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.user.delete).toHaveBeenLastCalledWith({
    where: {
      id: "11"
    }
  });
});

test("should return an error when deleting another user as non-admin", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  await expect(deleteUser("11", loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.user.delete).toHaveBeenCalledTimes(0);
});
