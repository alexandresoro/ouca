import { type ListSqlToken, type SqlFragment, sql } from "slonik";
import { buildAndClause, buildPaginationFragment, buildSortOrderFragment } from "./repository-helpers.js";

describe("buildAndClause function", () => {
  test("should return null when an empty object is provided", () => {
    expect(buildAndClause([])).toBeNull();
  });

  test("should return null when called with only empty properties", () => {
    const clause = [
      [sql.identifier(["tab1", "id1"]), ""],
      [sql.identifier(["tab1", "id2"]), ""],
      [sql.identifier(["tab2", "id1"]), []],
    ] as const;

    expect(buildAndClause(clause)).toBeNull();
  });

  test("should handle an object with a single property", () => {
    const clause = [[sql.identifier(["tab1", "id1"]), 12]] as const;

    expect(buildAndClause(clause)).toEqual<ListSqlToken>({
      glue: sql.fragment` AND `,
      members: [
        {
          glue: sql.fragment` = `,
          members: [
            {
              names: ["tab1", "id1"],
              type: "SLONIK_TOKEN_IDENTIFIER",
            },
            12,
          ],
          type: "SLONIK_TOKEN_LIST",
        },
      ],
      type: "SLONIK_TOKEN_LIST",
    });
  });

  test("should handle an object with a multiple properties of various types", () => {
    const clause = [
      [sql.identifier(["tab1", "id1"]), "toto"],
      [sql.identifier(["tab1", "id2"]), ""],
      [sql.identifier(["tab2", "id1"]), []],
      [sql.identifier(["tab2", "id2"]), [4, 8]],
      [sql.identifier(["tab2", "id3"]), ["titi", "tutu"]],
      [sql.identifier(["tab2", "id4"]), false],
      [sql.identifier(["tab3", "id1"]), 7, sql.fragment`<`],
      [sql.identifier(["tab4", "id1"]), null],
    ] as const;

    expect(buildAndClause(clause)).toEqual<ListSqlToken>({
      glue: sql.fragment` AND `,
      members: [
        {
          glue: sql.fragment` = `,
          members: [
            {
              names: ["tab1", "id1"],
              type: "SLONIK_TOKEN_IDENTIFIER",
            },
            "toto",
          ],
          type: "SLONIK_TOKEN_LIST",
        },
        {
          glue: sql.fragment` IN `,
          members: [
            {
              names: ["tab2", "id2"],
              type: "SLONIK_TOKEN_IDENTIFIER",
            },
            {
              sql: "($1,$2)",
              type: "SLONIK_TOKEN_FRAGMENT",
              values: [4, 8],
            },
          ],
          type: "SLONIK_TOKEN_LIST",
        },
        {
          glue: sql.fragment` IN `,
          members: [
            {
              names: ["tab2", "id3"],
              type: "SLONIK_TOKEN_IDENTIFIER",
            },
            {
              sql: "($1,$2)",
              type: "SLONIK_TOKEN_FRAGMENT",
              values: ["titi", "tutu"],
            },
          ],
          type: "SLONIK_TOKEN_LIST",
        },
        {
          glue: sql.fragment` = `,
          members: [
            {
              names: ["tab2", "id4"],
              type: "SLONIK_TOKEN_IDENTIFIER",
            },
            false,
          ],
          type: "SLONIK_TOKEN_LIST",
        },
        {
          glue: sql.fragment` < `,
          members: [
            {
              names: ["tab3", "id1"],
              type: "SLONIK_TOKEN_IDENTIFIER",
            },
            7,
          ],
          type: "SLONIK_TOKEN_LIST",
        },
        {
          glue: sql.fragment` IS `,
          members: [
            {
              names: ["tab4", "id1"],
              type: "SLONIK_TOKEN_IDENTIFIER",
            },
            {
              sql: "NULL",
              type: "SLONIK_TOKEN_FRAGMENT",
              values: [],
            },
          ],
          type: "SLONIK_TOKEN_LIST",
        },
      ],
      type: "SLONIK_TOKEN_LIST",
    });
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
