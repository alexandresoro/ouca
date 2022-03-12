import { DatabaseRole, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { LoggedUser } from "../../types/LoggedUser";
import { getSqlPagination, getSqlSorting, isEntityReadOnly } from "./entities-utils";

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

test("should return correct SQL pagination with null input", () => {
  expect(getSqlPagination(null)).toBe(Prisma.empty);
});

test("should return correct SQL pagination with undefined input", () => {
  expect(getSqlPagination(undefined)).toBe(Prisma.empty);
});

test("should return correct SQL pagination with empty object input", () => {
  expect(getSqlPagination({})).toBe(Prisma.empty);
});

test("should return correct SQL pagination with missing page size input", () => {
  expect(
    getSqlPagination({
      pageNumber: 1
    })
  ).toBe(Prisma.empty);
});

test("should return correct SQL pagination with missing page number input", () => {
  expect(
    getSqlPagination({
      pageSize: 20
    })
  ).toBe(Prisma.empty);
});

test("should return correct SQL pagination with valid input", () => {
  expect(
    getSqlPagination({
      pageNumber: 3,
      pageSize: 20
    }).text
  ).toEqual("LIMIT $1 OFFSET $2");
  expect(
    getSqlPagination({
      pageNumber: 3,
      pageSize: 20
    }).values
  ).toEqual([20, 60]);
});

test("should return correct SQL sorting with empty object input", () => {
  expect(getSqlSorting({})).toBe(Prisma.empty);
});

test("should return correct SQL sorting with missing order in input", () => {
  expect(
    getSqlSorting({
      sortOrder: "asc"
    })
  ).toBe(Prisma.empty);
});

test("should return correct SQL sorting with missing sort in input", () => {
  expect(
    getSqlSorting({
      orderBy: "toto"
    }).text
  ).toEqual("ORDER BY toto asc");
});

test("should return correct SQL sorting with all fields in input", () => {
  expect(
    getSqlSorting({
      orderBy: "toto",
      sortOrder: "desc"
    }).text
  ).toEqual("ORDER BY toto desc");
});
