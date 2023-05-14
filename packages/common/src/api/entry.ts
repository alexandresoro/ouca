import { z } from "zod";
import { entrySchema } from "../entities/entry.js";

/**
 * `PUT` `/entry/:id` Update of entry
 * `POST` `/entry` Create new entry
 */
export const upsertEntryInput = z.object({
  inventoryId: z.number(),
  speciesId: z.number(),
  sexId: z.number(),
  ageId: z.number(),
  numberEstimateId: z.number(),
  number: z.number().nullable(),
  distanceEstimateId: z.number().nullable(),
  distance: z.number().nullable(),
  regroupment: z.number().nullable(),
  comment: z.string().nullable(),
  behaviorIds: z.array(z.number()),
  environmentIds: z.array(z.number()),
});

export type UpsertEntryInput = z.infer<typeof upsertEntryInput>;

export const upsertEntryResponse = entrySchema;

export type UpsertEntryResponse = z.infer<typeof upsertEntryResponse>;

/**
 * `GET` `/entry/last`
 */
export const getEntryLastResponse = z.object({
  id: z.number().nullable(),
});

export type GetEntryLastResponse = z.infer<typeof getEntryLastResponse>;
