import { sql, type ListSqlToken, type SqlFragment } from "slonik";
import { objectsToKeyValueInsert, objectToKeyValueInsert, objectToKeyValueSet } from "./slonik-utils";

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
