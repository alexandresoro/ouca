import assert from "node:assert/strict";
import test, { beforeEach, describe } from "node:test";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { createUserInputFactory, userSettingsFactory } from "@fixtures/domain/user/user.fixtures.js";
import type { UserRepository } from "@interfaces/user-repository-interface.js";
import { err } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildUserService } from "./user-service.js";

const userRepository = mock<UserRepository>();

const userService = buildUserService({
  userRepository,
});

beforeEach(() => {
  userRepository.deleteUserById.mock.resetCalls();
  userRepository.updateUserSettings.mock.resetCalls();
});

describe("User creation", () => {
  test("should handle creation of user", async () => {
    const signupData = createUserInputFactory.build();

    await userService.createUser(signupData);

    assert.strictEqual(userRepository.createUser.mock.callCount(), 1);
  });
});

describe("User settings update", () => {
  test("should be able to update settings", async () => {
    const loggedUser = loggedUserFactory.build();
    const settings = userSettingsFactory.build();

    userRepository.updateUserSettings.mock.mockImplementationOnce(() =>
      Promise.resolve({ id: loggedUser.id, settings }),
    );

    await userService.updateSettings(loggedUser.id, settings);

    assert.strictEqual(userRepository.updateUserSettings.mock.callCount(), 1);
    assert.deepStrictEqual(userRepository.updateUserSettings.mock.calls[0].arguments, [loggedUser.id, settings]);
  });
});

describe("User deletion", () => {
  test("should be able to delete itself", async () => {
    const loggedUser = loggedUserFactory.build();

    await userService.deleteUser(loggedUser.id, loggedUser);

    assert.strictEqual(userRepository.deleteUserById.mock.callCount(), 1);
    assert.deepStrictEqual(userRepository.deleteUserById.mock.calls[0].arguments, [loggedUser.id]);
  });

  test("should be able delete to another user if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "admin",
    });

    userRepository.deleteUserById.mock.mockImplementationOnce(() => Promise.resolve(true));

    await userService.deleteUser("11", loggedUser);

    assert.strictEqual(userRepository.deleteUserById.mock.callCount(), 1);
    assert.deepStrictEqual(userRepository.deleteUserById.mock.calls[0].arguments, ["11"]);
  });

  test("should not be allowed when deleting another user as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "user",
    });

    const deleteResult = await userService.deleteUser("11", loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(userRepository.deleteUserById.mock.callCount(), 0);
  });
});
