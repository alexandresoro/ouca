import { canModifyEntity } from "@domain/entity-access/entity-access.js";
import type { LoggedUser } from "@domain/user/logged-user.js";

describe("canModifyEntity", () => {
  test("should return correct status for non logged user", () => {
    const entity = {};

    expect(canModifyEntity(entity, null)).toBe(false);
  });

  test("should return correct status when no entity is provided", () => {
    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    expect(canModifyEntity(null, user)).toBe(false);
  });

  test("should return correct status for non admin user and not owner", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: "22",
      role: "contributor",
    };

    expect(canModifyEntity(entity, user)).toBe(false);
  });

  test("should return correct status for owner", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: entity.ownerId,
      role: "contributor",
    };

    expect(canModifyEntity(entity, user)).toBe(true);
  });

  test("should return correct status for admin", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    expect(canModifyEntity(entity, user)).toBe(true);
  });

  test("should return correct status for non logged user and no entity owner", () => {
    const entity = {
      ownerId: null,
    };
    canModifyEntity;
    expect(canModifyEntity(entity, null)).toBe(false);
  });

  test("should return correct status for non-admin and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    const user: LoggedUser = {
      id: "22",
      role: "contributor",
    };

    expect(canModifyEntity(entity, user)).toBe(false);
  });

  test("should return correct status for admin and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    expect(canModifyEntity(entity, user)).toBe(true);
  });
});
