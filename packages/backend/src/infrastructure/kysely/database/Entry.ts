import { type Generated } from "kysely";

export type Entry = {
  id: Generated<number>;
  inventaireId: number;
  especeId: number;
  sexeId: number;
  ageId: number;
  estimationNombreId: number;
  nombre: number | null;
  estimationDistanceId: number | null;
  distance: number | null;
  commentaire: string | null;
  regroupement: number | null;
  dateCreation: Date;
};
