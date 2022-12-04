import { type DatabasePool } from "slonik";

export type DonneeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeRepository = ({ slonik }: DonneeRepositoryDependencies) => {
  return {};
};

export type DonneeRepository = ReturnType<typeof buildDonneeRepository>;
