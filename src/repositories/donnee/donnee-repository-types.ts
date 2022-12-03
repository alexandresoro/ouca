import { z } from "zod";

export const donneeSchema = z.object({
  id: z.number(),
  inventaireId: z.number(),
  especeId: z.number(),
  sexeId: z.number(),
  ageId: z.number(),
  estimationNombreId: z.number(),
  nombre: z.number().nullable(),
  estimationDistanceId: z.number().nullable(),
  distance: z.number().nullable(),
  commentaire: z.string().nullable(),
  regroupement: z.number().nullable(),
  dateCreation: z.date(),
});

export type Donnee = z.infer<typeof donneeSchema>;
