import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import { z } from "zod";
import type { SearchCriteria } from "../search/search-criteria.js";
import type { SortOrder } from "../shared/sort-order.js";

export type EntryFailureReason = AccessFailureReason;

export type EntryUpsertFailureReason =
  | {
      type: EntryFailureReason;
    }
  | {
      type: "similarEntryAlreadyExists";
      correspondingEntryFound: string;
    };

export const entrySchema = z.object({
  id: z.string(),
  inventoryId: z.string(),
  speciesId: z.string(),
  sexId: z.string(),
  ageId: z.string(),
  numberEstimateId: z.string(),
  number: z.number().nullable(),
  distanceEstimateId: z.string().nullable(),
  distance: z.number().nullable(),
  behaviorIds: z.array(z.string()),
  environmentIds: z.array(z.string()),
  comment: z.string().nullable(),
  grouping: z.number().nullable(),
  creationDate: z.date(),
});

export type Entry = z.infer<typeof entrySchema>;

export type EntryFindManyInput = Partial<{
  searchCriteria: SearchCriteria | null | undefined;
  orderBy:
    | "id"
    | "number"
    | "speciesCode"
    | "speciesName"
    | "sex"
    | "age"
    | "department"
    | "townCode"
    | "townName"
    | "locality"
    | "date"
    | "time"
    | "duration"
    | "observerName"
    | "creationDate"
    | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
  ownerId: string | null;
}>;

export type EntryCreateInput = {
  inventoryId: string;
  speciesId: string;
  sexId: string;
  ageId: string;
  numberEstimateId: string;
  number?: number | null;
  distanceEstimateId?: string | null;
  distance?: number | null;
  behaviorIds: string[];
  environmentIds: string[];
  comment?: string | null;
  grouping?: number | null;
};
