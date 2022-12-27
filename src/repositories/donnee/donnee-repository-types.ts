import { z } from "zod";
import { type SearchDonneeCriteria } from "../../graphql/generated/graphql-types";
import { type SortOrder } from "../common";

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
  dateCreation: z.number(), // timestamp
});

export type Donnee = z.infer<typeof donneeSchema>;

export const idSchema = donneeSchema.pick({ id: true });

export const maxRegoupementSchema = z.object({
  max: z.number().nullable(),
});

export type DonneeFindManyInput = Partial<{
  searchCriteria: SearchDonneeCriteria | null | undefined;
  orderBy:
    | "id"
    | "nombre"
    | "codeEspece"
    | "nomFrancais"
    | "sexe"
    | "age"
    | "departement"
    | "codeCommune"
    | "nomCommune"
    | "lieuDit"
    | "date"
    | "heure"
    | "duree"
    | "observateur"
    | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;
