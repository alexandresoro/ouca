import { type DatabasePool } from "slonik";

export type EstimationDistanceRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEstimationDistanceRepository = ({ slonik }: EstimationDistanceRepositoryDependencies) => {
  return {};
};

export type EstimationDistanceRepository = ReturnType<typeof buildEstimationDistanceRepository>;
