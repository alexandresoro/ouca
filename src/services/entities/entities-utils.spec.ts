import { DatabaseRole } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { LoggedUser } from "../../types/LoggedUser";
import { isEntityReadOnly } from "./entities-utils";

test("should return correct readonly status for non logged user", () => {
  const entity = mock<{ ownerId: string }>();

  expect(isEntityReadOnly(entity, null)).toBe(true);
});

test("should return correct readonly status for non admin user and not owner", () => {
  const entity = {
    ownerId: "12"
  };

  const user: LoggedUser = {
    id: "22",
    role: DatabaseRole.contributor
  };

  expect(isEntityReadOnly(entity, user)).toBe(true);
});

test("should return correct readonly status for owner", () => {
  const entity = {
    ownerId: "12"
  };

  const user: LoggedUser = {
    id: entity.ownerId,
    role: DatabaseRole.contributor
  };

  expect(isEntityReadOnly(entity, user)).toBe(false);
});

test("should return correct readonly status for admin", () => {
  const entity = {
    ownerId: "12"
  };

  const user: LoggedUser = {
    id: "22",
    role: DatabaseRole.admin
  };

  expect(isEntityReadOnly(entity, user)).toBe(false);
});

test("should return correct readonly status for non logged user and no entity owner", () => {
  const entity = {
    ownerId: null
  };

  expect(isEntityReadOnly(entity, null)).toBe(true);
});

test("should return correct readonly status for non-admin and no entity owner", () => {
  const entity = {
    ownerId: null
  };

  const user: LoggedUser = {
    id: "22",
    role: DatabaseRole.contributor
  };

  expect(isEntityReadOnly(entity, user)).toBe(true);
});

test("should return correct readonly status for admin and no entity owner", () => {
  const entity = {
    ownerId: null
  };

  const user: LoggedUser = {
    id: "22",
    role: DatabaseRole.admin
  };

  expect(isEntityReadOnly(entity, user)).toBe(false);
});
