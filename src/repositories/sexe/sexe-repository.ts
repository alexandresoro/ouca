import { type DatabasePool } from "slonik";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildSexeRepository = ({ slonik }: SexeRepositoryDependencies) => {
  return {};
};

export type SexeRepository = ReturnType<typeof buildSexeRepository>;
