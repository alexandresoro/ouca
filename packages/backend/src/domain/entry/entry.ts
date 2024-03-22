import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import { z } from "zod";

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
