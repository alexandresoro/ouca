import { sql, type ListSqlToken, type SqlFragment } from "slonik";
import { type SortOrder } from "./common";

export const objectToKeyValueSet = (
  obj: Record<string, string | number | boolean | undefined | null>
): ListSqlToken => {
  return sql.join(
    Object.entries(obj)
      .filter((entry): entry is [string, string | number | boolean] => entry[1] != null)
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
      .filter((entry): entry is [string, string | number | boolean] => entry[1] != null)
      .map((entry) => sql.identifier([entry[0]])),
    sql.fragment`, `
  )})
    VALUES
  (${sql.join(
    entries.filter((entry): entry is [string, string | number | boolean] => entry[1] != null).map((entry) => entry[1]),
    sql.fragment`, `
  )})
  `;
};

export const objectsToKeyValueInsert = <T extends string>(
  objects: Partial<Record<T, string | number | boolean | undefined | null>>[]
): SqlFragment => {
  const columnsToInsert = [
    ...new Set(
      objects
        .map((object) => {
          return Object.entries(object)
            .filter((entry): entry is [T, string | number | boolean] => entry[1] != null)
            .map((entry) => entry[0]);
        })
        .flat()
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
