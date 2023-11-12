import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type UserRepository } from "@interfaces/user-repository-interface.js";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { buildUserService, type CreateUserInput } from "./user-service.js";

const userRepository = mock<UserRepository>({
  createUser: vi.fn(),
});

const userService = buildUserService({
  userRepository,
});

describe("User creation", () => {
  test("should handle creation of user", async () => {
    const signupData = mock<CreateUserInput>();

    userRepository.createUser.mockResolvedValueOnce(mock());

    await userService.createUser(signupData);

    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
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
