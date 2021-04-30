import { Commune } from "../types/commune.model";

export const findCommuneById = <T extends Commune | { id: number }>(communes: T[], id: number): T => {
  return communes.find((commune) => {
    return id === commune.id;
  });
};
