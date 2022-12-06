import { type SqlFragment } from "slonik";
import { type SortOrder } from "./common";
import { buildPaginationFragment, buildSortOrderFragment } from "./repository-helpers";

describe("buildSortOrder function", () => {
  test("should return an empty fragment when no order is requested", () => {
    const orderInfo = {
      sortOrder: "asc" as SortOrder,
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
      sortOrder: "asc" as SortOrder,
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
      sortOrder: "desc" as SortOrder,
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
