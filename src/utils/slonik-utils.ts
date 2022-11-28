import { sql, type ListSqlToken, type SqlFragment } from "slonik";

export const objectToKeyValueSet = (
  obj: Record<string, string | number | boolean | undefined | null>
): ListSqlToken => {
  return sql.join(
    Object.entries(obj)
      .filter((entry): entry is [string, string | number | boolean] => !!entry[1])
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
    entries.map((entry) => sql.identifier([entry[0]])),
    sql.fragment`, `
  )})
    VALUES
  (${sql.join(
    entries.filter((entry): entry is [string, string | number | boolean] => !!entry[1]).map((entry) => entry[1]),
    sql.fragment`, `
  )})
  `;
};
