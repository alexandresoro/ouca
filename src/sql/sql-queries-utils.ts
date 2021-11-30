import { SqlConnection } from "./sql-connection";

export function query<T>(query: string): Promise<T> {
  return SqlConnection.query(query + ";");
}
