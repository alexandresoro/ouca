import { type DatabasePool } from "slonik";

export type ClasseRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildClasseRepository = ({ slonik }: ClasseRepositoryDependencies) => {
  return {};
};

export type ClasseRepository = ReturnType<typeof buildClasseRepository>;
