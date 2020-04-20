import { Commune } from "../commune.model";

export const findCommuneById = (communes: Commune[], id: number): Commune => {
  return communes.find((commune) => {
    return id === commune.id;
  });
};
