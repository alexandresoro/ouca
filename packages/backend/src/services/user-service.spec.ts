import { type Redis } from "ioredis";
import { type Logger } from "pino";
import { createMockPool } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type UserRepository } from "../repositories/user/user-repository.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";
import { buildUserService, type CreateUserInput } from "./user-service.js";

const userRepository = mock<UserRepository>({
  createUser: vi.fn(),
});
const settingsRepository = mock<SettingsRepository>({
  createDefaultSettings: vi.fn(),
});
const logger = mock<Logger>();
const slonik = createMockPool({
  query: vi.fn(),
});
const redis = mock<Redis>();

const userService = buildUserService({
  logger,
  slonik,
  redis,
  userRepository,
  settingsRepository,
});

describe("User creation", () => {
  test("should handle creation of user", async () => {
    const signupData = mock<CreateUserInput>();
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    userRepository.createUser.mockResolvedValueOnce(mock());

    await userService.createUser(signupData, loggedUser);

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
