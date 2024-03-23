import {
  type IdentifierSqlToken,
  type ListSqlToken,
  type PrimitiveValueExpression,
  type SqlFragment,
  sql,
} from "slonik";
import type { SortOrder } from "./common.js";

/**
 * @deprecated
 */
export const buildAndClause = (
  conditions:
    | readonly (readonly [
        IdentifierSqlToken,
        string | number | boolean | readonly string[] | readonly number[] | null,
        Readonly<{
          type: "SLONIK_TOKEN_FRAGMENT";
          sql: string;
          values: PrimitiveValueExpression[];
        }>?,
      ])[]
    | null
    | undefined,
): ListSqlToken | null => {
  if (!conditions?.length) {
    return null;
  }

  const filteredConditions = conditions.filter(([, value]) => {
    // Ignore empty arrays and empty strings
    return !(typeof value === "string" && !value.trim().length) && !(Array.isArray(value) && !value.length);
  });

  if (!filteredConditions.length) {
    return null;
  }

  const conditionsFragments = filteredConditions.map(([identifier, value, overrideConditionComparator]) => {
    if (value === null) {
      return sql.join([identifier, sql.fragment`NULL`], sql.fragment` IS `);
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (Array.isArray(value)) {
      return sql.join([identifier, sql.fragment`(${sql.join(value, sql.fragment`,`)})`], sql.fragment` IN `);
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return sql.join(
        [identifier, value],
        overrideConditionComparator ? sql.fragment` ${overrideConditionComparator} ` : sql.fragment` = `,
      );
    }
  });

  return sql.join(conditionsFragments, sql.fragment` AND `);
};

/**
 * @deprecated
 */
export const buildSortOrderFragment = ({
  orderBy,
  sortOrder,
}: {
  orderBy?: unknown;
  sortOrder?: SortOrder;
}): SqlFragment => {
  if (!orderBy || !sortOrder) {
    return sql.fragment``;
  }
  // TODO handle null last cases
  return sortOrder === "asc" ? sql.fragment` ASC` : sql.fragment` DESC`;
};

/**
 * @deprecated
 */
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
