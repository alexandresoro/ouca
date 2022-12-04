import { type DatabasePool } from "slonik";

export type EspeceRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEspeceRepository = ({ slonik }: EspeceRepositoryDependencies) => {
  return {};
};

export type EspeceRepository = ReturnType<typeof buildEspeceRepository>;
