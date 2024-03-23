import type { LegacySearchCriteria } from "@domain/search/search-criteria.js";
import { z } from "zod";
import type { SortOrder } from "../common.js";

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
export type Donnee = z.infer<typeof donneeSchema>;

/**
 * @deprecated
 */
export type DonneeFindManyInput = Partial<{
  searchCriteria: LegacySearchCriteria | null | undefined;
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
