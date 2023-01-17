import { mock } from "vitest-mock-extended";
import { type LoggedUser } from "../../types/User";
import { isEntityEditable } from "./entities-utils";

describe("Entity editable status", () => {
  test("should return correct status for non logged user", () => {
    const entity = mock<{ ownerId: string }>();

    expect(isEntityEditable(entity, null)).toBe(false);
  });

  test("should return correct status when no entity is provided", () => {
    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    expect(isEntityEditable(null, user)).toBe(false);
  });

  test("should return correct status for non admin user and not owner", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: "22",
      role: "contributor",
    };

    expect(isEntityEditable(entity, user)).toBe(false);
  });

  test("should return correct status for owner", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: entity.ownerId,
      role: "contributor",
    };

    expect(isEntityEditable(entity, user)).toBe(true);
  });

  test("should return correct status for admin", () => {
    const entity = {
      ownerId: "12",
    };

    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    expect(isEntityEditable(entity, user)).toBe(true);
  });

  test("should return correct status for non logged user and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    expect(isEntityEditable(entity, null)).toBe(false);
  });

  test("should return correct status for non-admin and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    const user: LoggedUser = {
      id: "22",
      role: "contributor",
    };

    expect(isEntityEditable(entity, user)).toBe(false);
  });

  test("should return correct status for admin and no entity owner", () => {
    const entity = {
      ownerId: null,
    };

    const user: LoggedUser = {
      id: "22",
      role: "admin",
    };

    expect(isEntityEditable(entity, user)).toBe(true);
  });
});
