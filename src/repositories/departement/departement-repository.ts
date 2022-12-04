import { type DatabasePool } from "slonik";

export type DepartementRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDepartementRepository = ({ slonik }: DepartementRepositoryDependencies) => {
  return {};
};

export type DepartementRepository = ReturnType<typeof buildDepartementRepository>;
