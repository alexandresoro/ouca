import { EstimationNombreDb } from "../objects/db/estimation-nombre-db.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";
import {
  COLUMN_LIBELLE,
  ORDER_ASC,
  TABLE_ESTIMATION_NOMBRE
} from "../utils/constants";
import { queryToFindNumberOfDonneesByDonneeEntityId } from "./sql-queries-donnee";
import { query, queryToFindAllEntities } from "./sql-queries-utils";

export const queryToCreateEstimationNombreTable = async (): Promise<void> => {
  return query<void>("CREATE TABLE IF NOT EXISTS estimation_nombre (" +
    " id SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT," +
    " libelle VARCHAR(100) NOT NULL," +
    " non_compte BIT(1) NOT NULL," +
    " PRIMARY KEY (id)," +
    " UNIQUE KEY `unique_libelle` (libelle)" +
    " )");
}

export const queryToFindAllEstimationsNombre = async (): Promise<
  EstimationNombreDb[]
> => {
  return queryToFindAllEntities<EstimationNombreDb>(
    TABLE_ESTIMATION_NOMBRE,
    COLUMN_LIBELLE,
    ORDER_ASC
  );
};

export const queryToFindNumberOfDonneesByEstimationNombreId = async (
  estimationId?: number
): Promise<NumberOfObjectsById[]> => {
  return queryToFindNumberOfDonneesByDonneeEntityId(
    "estimation_nombre_id",
    estimationId
  );
};
