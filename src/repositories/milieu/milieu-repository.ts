import { type DatabasePool } from "slonik";

export type MilieuRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildMilieuRepository = ({ slonik }: MilieuRepositoryDependencies) => {
  return {};
};

export type MilieuRepository = ReturnType<typeof buildMilieuRepository>;
