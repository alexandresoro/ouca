import { z } from "zod";
import { ageSchema } from "./age.js";
import { behaviorSchema } from "./behavior.js";
import { distanceEstimateSchema } from "./distance-estimate.js";
import { environmentSchema } from "./environment.js";
import { numberEstimateSchema } from "./number-estimate.js";
import { sexSchema } from "./sex.js";
import { speciesSchema } from "./species.js";

export const entrySchema = z.object({
  id: z.coerce.string(),
  inventoryId: z.string(),
  species: speciesSchema,
  sex: sexSchema,
  age: ageSchema,
  numberEstimate: numberEstimateSchema,
  number: z.number().nullable(),
  distanceEstimate: distanceEstimateSchema.nullable(),
  distance: z.number().nullable(),
  regroupment: z.number().nullable(),
  behaviors: z.array(behaviorSchema),
  environments: z.array(environmentSchema),
  comment: z.string().nullable(),
});

export type Entry = z.infer<typeof entrySchema>;

export const entryNavigationSchema = z.object({
  previousEntryId: z.string().nullable(),
  nextEntryId: z.string().nullable(),
  index: z.number(),
});

export type EntryNavigation = z.infer<typeof entryNavigationSchema>;
