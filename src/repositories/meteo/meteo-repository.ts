import { type DatabasePool } from "slonik";

export type MeteoRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildMeteoRepository = ({ slonik }: MeteoRepositoryDependencies) => {
  return {};
};

export type MeteoRepository = ReturnType<typeof buildMeteoRepository>;
