import { DatabaseRole } from "@prisma/client";
import { LoggedUser } from "../../types/LoggedUser";
import { isEntityReadOnly } from "./entities-utils";

test("should return correct readonly status for non logged user", () => {
  const entity = {
    ownerId: "12"
  };

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
    id: "12",
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
