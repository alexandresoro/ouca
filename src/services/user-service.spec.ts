import { DatabaseRole, User } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { EditUserData, UserCreateInput, UserLoginInput } from "../graphql/generated/graphql-types";
import { prismaMock } from "../sql/prisma-mock";
import { LoggedUser } from "../types/LoggedUser";
import { OucaError } from "../utils/errors";
import { logger } from "../utils/logger";
import options from "../utils/options";
import { createUser, deleteUser, getHashedPassword, loginUser, updateUser, validatePassword } from "./user-service";

beforeAll(() => {
  logger.level = "silent";
});

describe("Password validator", () => {
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
});

describe("User creation", () => {
  test("should throw error when signups are disabled", async () => {
    const signupData = mock<UserCreateInput>();
    const loggedUser = mock<LoggedUser>();
    options.signupsAllowed = false;

    await expect(() => createUser(signupData, DatabaseRole.contributor, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0005")
    );

    expect(prismaMock.user.create).toHaveBeenCalledTimes(0);
  });

  test("should throw error when creating initial admin and no env password defined", async () => {
    const signupData = mock<UserCreateInput>();
    const loggedUser = mock<LoggedUser>();
    options.signupsAllowed = true;
    options.defaultAdminPassword = "";

    prismaMock.user.count.mockResolvedValueOnce(0);

    await expect(() => createUser(signupData, DatabaseRole.contributor, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0006")
    );

    expect(prismaMock.user.create).toHaveBeenCalledTimes(0);
  });

  test("should throw error when creating initial admin and incorrect password provided", async () => {
    const signupData = mock<UserCreateInput>({
      password: "wrong"
    });
    const loggedUser = mock<LoggedUser>();
    options.signupsAllowed = true;
    options.defaultAdminPassword = "right";

    prismaMock.user.count.mockResolvedValueOnce(0);

    await expect(() => createUser(signupData, DatabaseRole.contributor, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0006")
    );

    expect(prismaMock.user.create).toHaveBeenCalledTimes(0);
  });

  test("should handle creation of initial admin and correct password provided", async () => {
    const signupData = mock<UserCreateInput>({
      password: "right"
    });
    const loggedUser = mock<LoggedUser>();
    options.signupsAllowed = true;
    options.defaultAdminPassword = "right";

    prismaMock.user.count.mockResolvedValueOnce(0);

    await createUser(signupData, DatabaseRole.contributor, loggedUser);

    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });

  test("should throw error when non admin tries to create a user", async () => {
    const signupData = mock<UserCreateInput>();
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor
    });
    options.signupsAllowed = true;

    prismaMock.user.count.mockResolvedValueOnce(1);

    await expect(() => createUser(signupData, DatabaseRole.contributor, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0007")
    );

    expect(prismaMock.user.create).toHaveBeenCalledTimes(0);
  });

  test("should handle creation of user when requested by an admin", async () => {
    const signupData = mock<UserCreateInput>({
      password: "anything"
    });
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin
    });
    options.signupsAllowed = true;

    prismaMock.user.count.mockResolvedValueOnce(2);

    await createUser(signupData, DatabaseRole.contributor, loggedUser);

    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });
});

describe("User login", () => {
  test("should rejects when log in with unknown account", async () => {
    const loginData = mock<UserLoginInput>();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(loginUser(loginData)).rejects.toEqual(new OucaError("OUCA0002"));
  });

  test("should rejects when log in with incorrect password", async () => {
    const loginData: UserLoginInput = {
      username: "bob",
      password: "toto"
    };

    const correctPassword = "mysupersafepassw0rd!";
    const hashedPassword = getHashedPassword(correctPassword);

    const matchingUser = mock<User>({
      username: loginData.username,
      password: hashedPassword
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(matchingUser);

    await expect(loginUser(loginData)).rejects.toEqual(new OucaError("OUCA0003"));
  });

  test("should return userinfo when log in correctly", async () => {
    const correctPassword = "mysupersafepassw0rd!";
    const hashedPassword = getHashedPassword(correctPassword);

    const loginData: UserLoginInput = {
      username: "bob",
      password: correctPassword
    };

    const matchingUser = mock<User>({
      username: loginData.username,
      password: hashedPassword
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(matchingUser);

    const { password, ...userInfo } = matchingUser;
    await expect(loginUser(loginData)).resolves.toEqual(userInfo);
  });
});

describe("User update", () => {
  test("should be able to edit itself", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor
    };

    const correctPassword = "mysupersafepassw0rd!";
    const hashedPassword = getHashedPassword(correctPassword);

    const editUserData = mock<EditUserData>({
      currentPassword: correctPassword,
      newPassword: "xd"
    });

    const matchingUser = mock<User>({
      password: hashedPassword
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(matchingUser);

    await updateUser(loggedUser.id, editUserData, loggedUser);

    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
  });

  test("should not be able to edit an non existing user", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor
    };

    const editUserData = mock<EditUserData>();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(updateUser(loggedUser.id, editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0002"));

    expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
  });

  test("should not be able to edit when incorrect password provided", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor
    };

    const correctPassword = "mysupersafepassw0rd!";
    const hashedPassword = getHashedPassword(correctPassword);

    const editUserData = mock<EditUserData>({
      currentPassword: "lol"
    });

    const matchingUser = mock<User>({
      password: hashedPassword
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(matchingUser);

    await expect(updateUser(loggedUser.id, editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0003"));

    expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
  });

  test("should not be able to edit when password missing", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor
    };

    const correctPassword = "mysupersafepassw0rd!";
    const hashedPassword = getHashedPassword(correctPassword);

    const editUserData = mock<EditUserData>({
      currentPassword: undefined
    });

    const matchingUser = mock<User>({
      password: hashedPassword
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(matchingUser);

    await expect(updateUser(loggedUser.id, editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0003"));

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

    const matchingUser = mock<User>({
      password: hashedPassword
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(matchingUser);

    await updateUser("11", editUserData, loggedUser);

    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
  });

  test("should return an error when editing another user as non-admin", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor
    };

    const editUserData = mock<EditUserData>();

    await expect(updateUser("11", editUserData, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
  });
});

describe("User deletion", () => {
  test("should be able to delete itself", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor
    };

    await deleteUser(loggedUser.id, loggedUser);

    expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.delete).toHaveBeenLastCalledWith({
      where: {
        id: loggedUser.id
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
});
