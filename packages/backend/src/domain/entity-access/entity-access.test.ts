import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { canModifyEntity } from "@domain/entity-access/entity-access.js";
import type { LoggedUser } from "@domain/user/logged-user.js";

describe("canModifyEntity", () => {
  test("should return correct status for non logged user", () => {
    const entity = {};

    assert.strictEqual(canModifyEntity(entity, null), false);
  });

  test("should return correct status when no entity is provided", () => {
    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    assert.strictEqual(canModifyEntity(null, user), false);
  });

  test("should return correct status for non admin user and not owner", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: "22",
      role: "user",
    };

    assert.strictEqual(canModifyEntity(entity, user), false);
  });

  test("should return correct status for owner", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: entity.ownerId,
      role: "user",
    };

    assert.ok(canModifyEntity(entity, user));
  });

  test("should return correct status for admin", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    assert.ok(canModifyEntity(entity, user));
  });

  test("should return correct status for non logged user and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    assert.strictEqual(canModifyEntity(entity, null), false);
  });

  test("should return correct status for non-admin and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    const user: LoggedUser = {
      id: "22",
      role: "user",
    };

    assert.strictEqual(canModifyEntity(entity, user), false);
  });

  test("should return correct status for admin and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    assert.ok(canModifyEntity(entity, user));
  });
});
