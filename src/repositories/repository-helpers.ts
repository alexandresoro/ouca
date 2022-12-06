import { sql, type SqlFragment } from "slonik";
import { z } from "zod";
import { type SortOrder } from "./common";

export const countSchema = z.object({
  count: z.number(),
});

export const buildSortOrderFragment = ({
  orderBy,
  sortOrder,
}: {
  orderBy?: unknown | null;
  sortOrder?: SortOrder;
}): SqlFragment => {
  if (!orderBy || !sortOrder) {
    return sql.fragment``;
  }
  return sortOrder === "asc" ? sql.fragment` ASC` : sql.fragment` DESC`;
};

export const buildPaginationFragment = ({
  offset,
  limit,
}: {
  offset?: number | null;
  limit?: number | null;
}): SqlFragment => {
  return sql.fragment`
    ${limit ? sql.fragment`LIMIT ${limit}` : sql.fragment``}
    ${offset ? sql.fragment`OFFSET ${offset}` : sql.fragment``}
  `;
};
