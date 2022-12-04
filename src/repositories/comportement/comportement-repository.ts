import { type DatabasePool } from "slonik";

export type ComportementRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildComportementRepository = ({ slonik }: ComportementRepositoryDependencies) => {
  return {};
};

export type ComportementRepository = ReturnType<typeof buildComportementRepository>;
