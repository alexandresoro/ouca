import { EstimationNombre } from "@ou-ca/ouca-model";
import { buildEstimationNombreFromEstimationNombreDb, buildEstimationsNombreFromEstimationsNombreDb } from "../mapping/estimation-nombre-mapping";
import { EstimationNombreDb } from "../objects/db/estimation-nombre-db.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { queryToFindAllEstimationsNombre, queryToFindNumberOfDonneesByEstimationNombreId } from "../sql/sql-queries-estimation-nombre";
import { DB_SAVE_MAPPING, queryToFindEntityByLibelle } from "../sql/sql-queries-utils";
import { TABLE_ESTIMATION_NOMBRE } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { persistEntity } from "./sql-api-common";

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
  const estimationsDb = await queryToFindEntityByLibelle<EstimationNombreDb>(
    TABLE_ESTIMATION_NOMBRE,
    libelle
  );

  if (estimationsDb && estimationsDb[0]?.id) {
    return buildEstimationNombreFromEstimationNombreDb(estimationsDb[0]);
  }

  return null;
};

export const persistEstimationNombre = async (
  estimation: EstimationNombre
): Promise<SqlSaveResponse> => {
  return persistEntity(
    TABLE_ESTIMATION_NOMBRE,
    estimation,
    DB_SAVE_MAPPING.get("estimationNombre")
  );
};
