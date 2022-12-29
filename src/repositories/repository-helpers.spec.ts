import { sql, type ListSqlToken, type SqlFragment } from "slonik";
import {
  buildAndClause,
  buildPaginationFragment,
  buildSortOrderFragment,
  objectsToKeyValueInsert,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "./repository-helpers";

describe("objectToKeyValueSet function", () => {
  test("should return an empty string when an empty object is provided", () => {
    const obj = {};

    expect(objectToKeyValueSet(obj)).toEqual<ListSqlToken>({
      glue: sql.fragment`, `,
      members: [],
      type: "SLONIK_TOKEN_LIST",
    });
  });

  test("should handle an object with a single property", () => {
    const obj = {
      key: "value",
    };

    expect(objectToKeyValueSet(obj)).toEqual<ListSqlToken>({
      glue: sql.fragment`, `,
      members: [
        {
          sql: '"key" = $1',
          type: "SLONIK_TOKEN_FRAGMENT",
          values: ["value"],
        },
      ],
      type: "SLONIK_TOKEN_LIST",
    });
  });

  test("should handle an object with a multiple properties of various types", () => {
    const obj = {
      key: "value",
      numberKey: 12,
      booleanKey: true,
      falsyValue: false,
    };

    expect(objectToKeyValueSet(obj)).toEqual<ListSqlToken>({
      glue: sql.fragment`, `,
      members: [
        {
          sql: '"key" = $1',
          type: "SLONIK_TOKEN_FRAGMENT",
          values: ["value"],
        },
        {
          sql: '"numberKey" = $1',
          type: "SLONIK_TOKEN_FRAGMENT",
          values: [12],
        },
        {
          sql: '"booleanKey" = $1',
          type: "SLONIK_TOKEN_FRAGMENT",
          values: [true],
        },
        {
          sql: '"falsyValue" = $1',
          type: "SLONIK_TOKEN_FRAGMENT",
          values: [false],
        },
      ],
      type: "SLONIK_TOKEN_LIST",
    });
  });
});

describe("objectToKeyValueInsert function", () => {
  test("should return an empty fragment when an empty object is provided", () => {
    const obj = {};

    expect(objectToKeyValueInsert(obj)).toEqual<SqlFragment & { type: string }>(sql.fragment``);
  });

  test("should handle an object with a single property", () => {
    const obj = {
      key: "value",
    };

    expect(objectToKeyValueInsert(obj)).toEqual<SqlFragment & { type: string }>({
      sql: '\n  ("key")\n    VALUES\n  ($1)\n  ',
      type: "SLONIK_TOKEN_FRAGMENT",
      values: ["value"],
    });
  });

  test("should handle an object with a multiple properties of various types", () => {
    const obj = {
      key: "value",
      numberKey: 12,
      booleanKey: true,
      nullValue: null,
    };

    expect(objectToKeyValueInsert(obj)).toEqual<SqlFragment & { type: string }>({
      sql: '\n  ("key", "numberKey", "booleanKey")\n    VALUES\n  ($1, $2, $3)\n  ',
      type: "SLONIK_TOKEN_FRAGMENT",
      values: ["value", 12, true],
    });
  });
});

describe("objectsToKeyValueInsert function", () => {
  test("should return an empty fragment when an empty list is provided", () => {
    const objs = [] as Record<string, string | number | boolean | undefined | null>[];

    expect(objectsToKeyValueInsert(objs)).toEqual<SqlFragment & { type: string }>(sql.fragment``);
  });

  test("should handle a single object with multiple properties of various types", () => {
    const objs = [
      {
        key: "value",
        numberKey: 12,
        booleanKey: true,
        nullValue: null,
      },
    ];

    expect(objectsToKeyValueInsert(objs)).toEqual<SqlFragment & { type: string }>({
      sql: '\n  ("key", "numberKey", "booleanKey")\n    VALUES\n  ($1, $2, $3)\n  ',
      type: "SLONIK_TOKEN_FRAGMENT",
      values: ["value", 12, true],
    });
  });

  test("should handle multiple objects with different properties of various types", () => {
    const objs = [
      {
        key: "value",
        numberKey: 12,
        booleanKey: true,
        sometimesNullValue: null,
        nullishValue: null,
        nullValue: null,
      },
      {
        key: "value2",
        numberKey: 123,
        booleanKey: false,
        sometimesNullValue: "notsoNull",
        hello: "there",
        nullishValue: undefined,
      },
    ];

    expect(objectsToKeyValueInsert(objs)).toEqual<SqlFragment & { type: string }>({
      sql: '\n  ("key", "numberKey", "booleanKey", "sometimesNullValue", "hello")\n    VALUES\n  ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)\n  ',
      type: "SLONIK_TOKEN_FRAGMENT",
      values: ["value", 12, true, null, null, "value2", 123, false, "notsoNull", "there"],
    });
  });
});

describe("buildAndClause function", () => {
  test("should return an empty fragment when an empty object is provided", () => {
    expect(buildAndClause([])).toEqual(sql.fragment``);
  });

  test("should return an empty fragment when called with only empty properties", () => {
    const clause = [
      [sql.identifier(["tab1", "id1"]), ""],
      [sql.identifier(["tab1", "id2"]), ""],
      [sql.identifier(["tab2", "id1"]), []],
    ] as const;

    expect(buildAndClause(clause)).toEqual(sql.fragment``);
  });

  test("should handle an object with a single property", () => {
    const clause = [[sql.identifier(["tab1", "id1"]), 12]] as const;

    expect(buildAndClause(clause)).toEqual(sql.fragment`WHERE \"tab1\".\"id1\" = ${12}`);
  });

  test("should handle an object with a multiple properties of various types", () => {
    const clause = [
      [sql.identifier(["tab1", "id1"]), "toto"],
      [sql.identifier(["tab1", "id2"]), ""],
      [sql.identifier(["tab2", "id1"]), []],
      [sql.identifier(["tab2", "id2"]), [4, 8]],
      [sql.identifier(["tab2", "id3"]), ["titi", "tutu"]],
      [sql.identifier(["tab2", "id3"]), false],
      [sql.identifier(["tab2", "id1"]), 7, sql.fragment`<`],
    ] as const;

    expect(buildAndClause(clause)).toEqual(
      sql.fragment`WHERE \"tab1\".\"id1\" = ${"toto"} AND \"tab2\".\"id2\" IN (${4},${8}) AND \"tab2\".\"id3\" IN (${"titi"},${"tutu"}) AND \"tab2\".\"id3\" = ${false} AND \"tab2\".\"id1\" < ${7}`
    );
  });
});

describe("buildSortOrder function", () => {
  test("should return an empty fragment when no order is requested", () => {
    const orderInfo = {
      sortOrder: "asc" as const,
    };

    expect(buildSortOrderFragment(orderInfo)).toEqual<SqlFragment & { type: string }>({
      sql: "",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [],
    });
  });

  test("should return an empty fragment when no sort is requested", () => {
    const orderInfo = {
      orderBy: "id",
    };

    expect(buildSortOrderFragment(orderInfo)).toEqual<SqlFragment & { type: string }>({
      sql: "",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [],
    });
  });

  test("should return ascending order when ascending order is requested", () => {
    const orderInfo = {
      orderBy: "id",
      sortOrder: "asc" as const,
    };

    expect(buildSortOrderFragment(orderInfo)).toEqual<SqlFragment & { type: string }>({
      sql: " ASC",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [],
    });
  });

  test("should return descending order when descending order is requested", () => {
    const orderInfo = {
      orderBy: 47,
      sortOrder: "desc" as const,
    };

    expect(buildSortOrderFragment(orderInfo)).toEqual<SqlFragment & { type: string }>({
      sql: " DESC",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [],
    });
  });
});

describe("buildPaginationFragment function", () => {
  test("should return an empty fragment when no pagination is provided", () => {
    const pagination = {};

    expect(buildPaginationFragment(pagination)).toEqual<SqlFragment & { type: string }>({
      sql: "\n    \n    \n  ",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [],
    });
  });

  test("should return offset fragment when only offset provided", () => {
    const pagination = {
      offset: 12,
    };

    expect(buildPaginationFragment(pagination)).toEqual<SqlFragment & { type: string }>({
      sql: "\n    \n    OFFSET $1\n  ",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [12],
    });
  });

  test("should return limit fragment when only limit provided", () => {
    const pagination = {
      limit: 42,
    };

    expect(buildPaginationFragment(pagination)).toEqual<SqlFragment & { type: string }>({
      sql: "\n    LIMIT $1\n    \n  ",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [42],
    });
  });

  test("should return complete fragment when complete pagination provided", () => {
    const pagination = {
      offset: 47,
      limit: 34,
    };

    expect(buildPaginationFragment(pagination)).toEqual<SqlFragment & { type: string }>({
      sql: "\n    LIMIT $1\n    OFFSET $2\n  ",
      type: "SLONIK_TOKEN_FRAGMENT",
      values: [34, 47],
    });
  });
});
