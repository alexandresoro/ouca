import { type DatabasePool } from "slonik";

export type EstimationNombreRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEstimationNombreRepository = ({ slonik }: EstimationNombreRepositoryDependencies) => {
  return {};
};

export type EstimationNombreRepository = ReturnType<typeof buildEstimationNombreRepository>;
