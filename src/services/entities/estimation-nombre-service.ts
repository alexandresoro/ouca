import { EstimationNombre } from "../../model/types/estimation-nombre.object";
import { EstimationNombreDb } from "../../objects/db/estimation-nombre-db.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { buildEstimationNombreFromEstimationNombreDb, buildEstimationsNombreFromEstimationsNombreDb } from "../../sql/entities-mapping/estimation-nombre-mapping";
import { queryToFindAllEstimationsNombre, queryToFindNumberOfDonneesByEstimationNombreId } from "../../sql/sql-queries-estimation-nombre";
import { createKeyValueMapWithSameName, queryToFindEntityByLibelle } from "../../sql/sql-queries-utils";
import { TABLE_ESTIMATION_NOMBRE } from "../../utils/constants";
import { getNbByEntityId } from "../../utils/utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_ESTIMATION_NOMBRE = {
  ...createKeyValueMapWithSameName("libelle"),
  non_compte: "nonCompte"
}

export const findAllEstimationsNombre = async (): Promise<
  EstimationNombre[]
> => {
  const [estimationsDb, nbDonneesByEstimation] = await Promise.all([
    queryToFindAllEstimationsNombre(),
    queryToFindNumberOfDonneesByEstimationNombreId()
  ]);

  const estimations: EstimationNombre[] = buildEstimationsNombreFromEstimationsNombreDb(
    estimationsDb
  );

  estimations.forEach((estimation: EstimationNombre) => {
    estimation.nbDonnees = getNbByEntityId(estimation, nbDonneesByEstimation);
  });

  return estimations;
};

export const findEstimationNombreByLibelle = async (
  libelle: string
): Promise<EstimationNombre> => {
  const estimationDb = await queryToFindEntityByLibelle<EstimationNombreDb>(
    TABLE_ESTIMATION_NOMBRE,
    libelle
  );
  return buildEstimationNombreFromEstimationNombreDb(estimationDb);
};

export const persistEstimationNombre = async (
  estimation: EstimationNombre
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_ESTIMATION_NOMBRE,
    estimation,
    DB_SAVE_MAPPING_ESTIMATION_NOMBRE
  );
};

export const insertEstimationsNombre = async (
  estimationsNombre: EstimationNombre[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_ESTIMATION_NOMBRE, estimationsNombre, DB_SAVE_MAPPING_ESTIMATION_NOMBRE);
};
