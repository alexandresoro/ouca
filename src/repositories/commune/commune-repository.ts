import { type DatabasePool } from "slonik";

export type CommuneRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildCommuneRepository = ({ slonik }: CommuneRepositoryDependencies) => {
  return {};
};

export type CommuneRepository = ReturnType<typeof buildCommuneRepository>;
