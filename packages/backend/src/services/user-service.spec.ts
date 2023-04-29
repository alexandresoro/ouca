import { type Logger } from "pino";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import config from "../config.js";
import { type UserCreateInput } from "../graphql/generated/graphql-types.js";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type UserRepository } from "../repositories/user/user-repository.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";
import { buildUserService } from "./user-service.js";

const userRepository = mock<UserRepository>({
  getAdminsCount: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
});
const settingsRepository = mock<SettingsRepository>({
  createDefaultSettings: vi.fn(),
});
const logger = mock<Logger>();
const slonik = createMockPool({
  query: vi.fn(),
});

const userService = buildUserService({
  logger,
  slonik,
  userRepository,
  settingsRepository,
});

describe("User creation", () => {
  test("should throw error when signups are disabled", async () => {
    const signupData = mock<UserCreateInput>();
    const loggedUser = mock<LoggedUser>();
    config.admin.signupsAllowed = false;

    await expect(() => userService.createUser(signupData, "contributor", loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0005")
    );

    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  test("should throw error when creating initial admin and no env password defined", async () => {
    const signupData = mock<UserCreateInput>();
    const loggedUser = mock<LoggedUser>();
    config.admin.signupsAllowed = true;
    config.admin.defaultAdminPassword = "";

    userRepository.getAdminsCount.mockResolvedValueOnce(0);

    await expect(() => userService.createUser(signupData, "contributor", loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0006")
    );

    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  test("should throw error when creating initial admin and incorrect password provided", async () => {
    const signupData = mock<UserCreateInput>({
      password: "wrong",
    });
    const loggedUser = mock<LoggedUser>();
    config.admin.signupsAllowed = true;
    config.admin.defaultAdminPassword = "right";

    userRepository.getAdminsCount.mockResolvedValueOnce(0);

    await expect(() => userService.createUser(signupData, "contributor", loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0006")
    );

    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  test("should handle creation of initial admin and correct password provided", async () => {
    const signupData = mock<UserCreateInput>({
      password: "right",
    });
    const loggedUser = mock<LoggedUser>();
    config.admin.signupsAllowed = true;
    config.admin.defaultAdminPassword = "right";

    userRepository.getAdminsCount.mockResolvedValueOnce(0);
    userRepository.createUser.mockResolvedValueOnce(mock());

    await userService.createUser(signupData, "contributor", loggedUser);

    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
    expect(settingsRepository.createDefaultSettings).toHaveBeenCalledTimes(1);
  });

  test("should throw error when non admin tries to create a user", async () => {
    const signupData = mock<UserCreateInput>();
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });
    config.admin.signupsAllowed = true;

    userRepository.getAdminsCount.mockResolvedValueOnce(1);

    await expect(() => userService.createUser(signupData, "contributor", loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0007")
    );

    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  test("should handle creation of user when requested by an admin", async () => {
    const signupData = mock<UserCreateInput>({
      password: "anything",
    });
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });
    config.admin.signupsAllowed = true;

    userRepository.getAdminsCount.mockResolvedValueOnce(2);
    userRepository.createUser.mockResolvedValueOnce(mock());

    await userService.createUser(signupData, "contributor", loggedUser);

    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
    expect(settingsRepository.createDefaultSettings).toHaveBeenCalledTimes(1);
  });
});

describe("User deletion", () => {
  test("should be able to delete itself", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    userRepository.deleteUserById.mockResolvedValueOnce(true);

    const result = await userService.deleteUser(loggedUser.id, loggedUser);

    expect(userRepository.deleteUserById).toHaveBeenCalledTimes(1);
    expect(userRepository.deleteUserById).toHaveBeenLastCalledWith(loggedUser.id);
    expect(result).toBe(true);
  });

  test("should be able delete to another user if admin", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "admin",
    };

    userRepository.deleteUserById.mockResolvedValueOnce(true);

    const result = await userService.deleteUser("11", loggedUser);

    expect(userRepository.deleteUserById).toHaveBeenCalledTimes(1);
    expect(userRepository.deleteUserById).toHaveBeenLastCalledWith("11");
    expect(result).toBe(true);
  });

  test("should return an error when deleting another user as non-admin", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    userRepository.deleteUserById.mockResolvedValueOnce(false);

    await expect(userService.deleteUser("11", loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(userRepository.deleteUserById).not.toHaveBeenCalled();
  });
});
