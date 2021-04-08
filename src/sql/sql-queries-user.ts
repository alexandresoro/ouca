import { query } from "./sql-queries-utils";

export const queryToCreateUserTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS user (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " firstname VARCHAR(100) NOT NULL," +
    " lastname VARCHAR(100) NOT NULL," +
    " PRIMARY KEY (id)" +
    " )");
}

export const queryToInitializeUserTable = async (): Promise<void> => {
  return query<void>("INSERT INTO user (id,firstname,lastname) VALUES (1,\"Utilisateur\",\"Générique\")");
}
