import { type DatabasePool } from "slonik";

export type AgeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildAgeRepository = ({ slonik }: AgeRepositoryDependencies) => {
  return {};
};

export type AgeRepository = ReturnType<typeof buildAgeRepository>;
