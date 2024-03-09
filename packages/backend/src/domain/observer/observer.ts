import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type ObserverFailureReason = CommonFailureReason;

export const observerSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  inventoriesCount: z.coerce.number(),
  entriesCount: z.coerce.number(),
});

export type Observer = z.infer<typeof observerSchema>;

export const observerSimpleSchema = observerSchema.omit({
  inventoriesCount: true,
  entriesCount: true,
});

export type ObserverSimple = z.infer<typeof observerSimpleSchema>;

export type ObserverFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type ObserverCreateInput = {
  libelle: string;
  ownerId?: string | null;
};
