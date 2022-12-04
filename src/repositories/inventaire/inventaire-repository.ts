import { type DatabasePool } from "slonik";

export type InventaireRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireRepository = ({ slonik }: InventaireRepositoryDependencies) => {
  return {};
};

export type InventaireRepository = ReturnType<typeof buildInventaireRepository>;
