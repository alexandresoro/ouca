import { OucaError } from "@domain/errors/ouca-error.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { createUserInputFactory } from "@fixtures/domain/user/user.fixtures.js";
import { type UserRepository } from "@interfaces/user-repository-interface.js";
import { mockVi } from "../../../utils/mock.js";
import { buildUserService } from "./user-service.js";

const userRepository = mockVi<UserRepository>();

const userService = buildUserService({
  userRepository,
});

describe("User creation", () => {
  test("should handle creation of user", async () => {
    const signupData = createUserInputFactory.build();

    await userService.createUser(signupData);

    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
  });
});

describe("User deletion", () => {
  test("should be able to delete itself", async () => {
    const loggedUser = loggedUserFactory.build();

    await userService.deleteUser(loggedUser.id, loggedUser);

    expect(userRepository.deleteUserById).toHaveBeenCalledTimes(1);
    expect(userRepository.deleteUserById).toHaveBeenLastCalledWith(loggedUser.id);
  });

  test("should be able delete to another user if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "admin",
    });

    userRepository.deleteUserById.mockResolvedValueOnce(true);

    await userService.deleteUser("11", loggedUser);

    expect(userRepository.deleteUserById).toHaveBeenCalledTimes(1);
    expect(userRepository.deleteUserById).toHaveBeenLastCalledWith("11");
  });

  test("should return an error when deleting another user as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    await expect(userService.deleteUser("11", loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(userRepository.deleteUserById).not.toHaveBeenCalled();
  });
});
