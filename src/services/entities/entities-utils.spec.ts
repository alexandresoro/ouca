import { Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { SortOrder } from "../../graphql/generated/graphql-types";
import { type LoggedUser } from "../../types/User";
import {
  getSqlPagination,
  getSqlSorting,
  isEntityEditable,
  transformQueryRawBigIntsToNumbers,
  transformQueryRawResultsBigIntsToNumbers,
} from "./entities-utils";

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
      pageNumber: 1,
    })
  ).toBe(Prisma.empty);
});

test("should return correct SQL pagination with missing page number input", () => {
  expect(
    getSqlPagination({
      pageSize: 20,
    })
  ).toBe(Prisma.empty);
});

test("should return correct SQL pagination with valid input", () => {
  expect(
    getSqlPagination({
      pageNumber: 3,
      pageSize: 20,
    }).text
  ).toEqual("LIMIT $1 OFFSET $2");
  expect(
    getSqlPagination({
      pageNumber: 3,
      pageSize: 20,
    }).values
  ).toEqual([20, 60]);
});

test("should return correct SQL sorting with empty object input", () => {
  expect(getSqlSorting({})).toBe(Prisma.empty);
});

test("should return correct SQL sorting with missing order in input", () => {
  expect(
    getSqlSorting({
      sortOrder: SortOrder.Asc,
    })
  ).toBe(Prisma.empty);
});

test("should return correct SQL sorting with missing sort in input", () => {
  expect(
    getSqlSorting({
      orderBy: "toto",
    }).text
  ).toEqual("ORDER BY toto asc");
});

test("should return correct SQL sorting with all fields in input", () => {
  expect(
    getSqlSorting({
      orderBy: "toto",
      sortOrder: SortOrder.Desc,
    }).text
  ).toEqual("ORDER BY toto desc");
});

describe("Methods that transform bigints returned by a query raw to numbers", () => {
  test("should properly return a positive value for a single result", () => {
    const result = {
      nbDonnees: BigInt(13n),
      toto: "tutu",
      test: 75,
    };

    expect(transformQueryRawBigIntsToNumbers(result)).toEqual({
      nbDonnees: 13,
      toto: "tutu",
      test: 75,
    });
  });

  test("should properly return a zero value for a single result", () => {
    const result = {
      nbDonnees: BigInt(0n),
      toto: "tutu",
      test: 75,
    };

    expect(transformQueryRawBigIntsToNumbers(result)).toEqual({
      nbDonnees: 0,
      toto: "tutu",
      test: 75,
    });
  });

  test("should handle multiple bigints", () => {
    const result = {
      nbDonnees: BigInt(13n),
      toto: "tutu",
      test: 75,
      nbEspeces: BigInt(7n),
    };

    expect(transformQueryRawBigIntsToNumbers(result)).toEqual({
      nbDonnees: 13,
      toto: "tutu",
      test: 75,
      nbEspeces: 7,
    });
  });

  test("should handle an array of results", () => {
    const results = [
      {
        nbDonnees: BigInt(0n),
        toto: "tutu",
        test: 75,
      },
      {
        nbDonnees: BigInt(13n),
        toto: "tutu",
        test: 75,
        nbEspeces: BigInt(32n),
      },
      {
        somethingRandom: BigInt(17n),
      },
      {
        otherRandom: "hello there",
      },
    ];

    expect(transformQueryRawResultsBigIntsToNumbers(results)).toEqual([
      {
        nbDonnees: 0,
        toto: "tutu",
        test: 75,
      },
      {
        nbDonnees: 13,
        toto: "tutu",
        test: 75,
        nbEspeces: 32,
      },
      {
        somethingRandom: 17,
      },
      {
        otherRandom: "hello there",
      },
    ]);
  });

  test("should handle an empty array of results as input", () => {
    expect(transformQueryRawResultsBigIntsToNumbers([]).map((result) => result.nbDonnees)).toEqual([]);
  });
});
