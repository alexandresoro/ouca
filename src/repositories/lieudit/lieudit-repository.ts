import { type DatabasePool } from "slonik";

export type LieuditRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildLieuditRepository = ({ slonik }: LieuditRepositoryDependencies) => {
  return {};
};

export type LieuditRepository = ReturnType<typeof buildLieuditRepository>;
