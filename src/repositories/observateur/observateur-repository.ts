import { type DatabasePool } from "slonik";

export type ObservateurRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildObservateurRepository = ({ slonik }: ObservateurRepositoryDependencies) => {
  return {};
};

export type ObservateurRepository = ReturnType<typeof buildObservateurRepository>;
