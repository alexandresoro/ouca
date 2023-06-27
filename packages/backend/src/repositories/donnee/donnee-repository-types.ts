import { type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { z } from "zod";
import { type SortOrder } from "../common.js";
import { type SearchCriteria } from "../search-criteria.js";

export const donneeSchema = z.object({
  id: z.string(),
  inventaireId: z.string(),
  especeId: z.string(),
  sexeId: z.string(),
  ageId: z.string(),
  estimationNombreId: z.string(),
  nombre: z.number().nullable(),
  estimationDistanceId: z.string().nullable(),
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
  searchCriteria: SearchCriteria | null | undefined;
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

export type DonneeFindMatchingInput = DonneeCreateInput &
  Required<Pick<UpsertEntryInput, "behaviorIds" | "environmentIds">>;

export type DonneeCreateInput = {
  inventaire_id: number;
  espece_id: number;
  sexe_id: number;
  age_id: number;
  estimation_nombre_id: number;
  nombre?: number | null;
  estimation_distance_id?: number | null;
  distance?: number | null;
  commentaire?: string | null;
  regroupement?: number | null;
};
