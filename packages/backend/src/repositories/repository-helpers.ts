import {
  sql,
  type IdentifierSqlToken,
  type ListSqlToken,
  type PrimitiveValueExpression,
  type SqlFragment,
} from "slonik";
import { type SortOrder } from "./common.js";

export const objectToKeyValueSet = (
  obj: Record<string, string | number | boolean | undefined | null>
): ListSqlToken => {
  return sql.join(
    Object.entries(obj)
      .filter((entry): entry is [string, string | number | boolean | null] => entry[1] !== undefined)
      .map(([key, value]) => {
        return sql.fragment`${sql.identifier([key])} = ${value}`;
      }),
    sql.fragment`, `
  );
};

export const objectToKeyValueInsert = (
  obj: Record<string, string | number | boolean | undefined | null>
): SqlFragment => {
  const entries = Object.entries(obj);
  if (!entries?.length) {
    return sql.fragment``;
  }
  return sql.fragment`
  (${sql.join(
    entries
      .filter((entry): entry is [string, string | number | boolean | null] => entry[1] !== undefined)
      .map((entry) => sql.identifier([entry[0]])),
    sql.fragment`, `
  )})
    VALUES
  (${sql.join(
    entries
      .filter((entry): entry is [string, string | number | boolean | null] => entry[1] !== undefined)
      .map((entry) => entry[1]),
    sql.fragment`, `
  )})
  `;
};

export const objectsToKeyValueInsert = <T extends string>(
  objects: Partial<Record<T, string | number | boolean | undefined | null>>[]
): SqlFragment => {
  // FIXME There's an edge case where one property could be undefined in an object and defined in another
  // In that case, it will set it to NULL in DB.
  // The correct way should be to make sure that insert is containing the same props for everyone I believe
  // and values cannot be undefined
  const columnsToInsert = [
    ...new Set(
      objects.flatMap((object) => {
        return Object.entries(object)
          .filter((entry): entry is [T, string | number | boolean | null] => entry[1] !== undefined)
          .map((entry) => entry[0]);
      })
    ),
  ];
  if (!columnsToInsert?.length) {
    return sql.fragment``;
  }
  return sql.fragment`
  (${sql.join(
    columnsToInsert.map((entry) => sql.identifier([entry])),
    sql.fragment`, `
  )})
    VALUES
  (${sql.join(
    objects.map((object) => {
      return sql.join(
        columnsToInsert.map((column) => object?.[column] ?? null),
        sql.fragment`, `
      );
    }),
    sql.fragment`), (`
  )})
  `;
};

export const buildAndClause = (
  conditions:
    | readonly (readonly [
        IdentifierSqlToken,
        string | number | boolean | readonly string[] | readonly number[],
        Readonly<{
          type: "SLONIK_TOKEN_FRAGMENT";
          sql: string;
          values: PrimitiveValueExpression[];
        }>?
      ])[]
    | null
    | undefined
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
    if (Array.isArray(value)) {
      return sql.join([identifier, sql.fragment`(${sql.join(value, sql.fragment`,`)})`], sql.fragment` IN `);
    } else {
      return sql.join(
        [identifier, value],
        overrideConditionComparator ? sql.fragment` ${overrideConditionComparator} ` : sql.fragment` = `
      );
    }
  });

  return sql.join(conditionsFragments, sql.fragment` AND `);
};

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
