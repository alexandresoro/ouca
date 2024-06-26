import { z } from "zod";
import { ageSchema } from "./age.js";
import { behaviorSchema } from "./behavior.js";
import { distanceEstimateSchema } from "./distance-estimate.js";
import { environmentSchema } from "./environment.js";
import { numberEstimateSchema } from "./number-estimate.js";
import { sexSchema } from "./sex.js";
import { speciesSchema } from "./species.js";

export const entrySchema = z.object({
  id: z.string(),
  inventoryId: z.string(),
  species: speciesSchema,
  sex: sexSchema,
  age: ageSchema,
  numberEstimate: numberEstimateSchema,
  number: z.number().nullable(),
  distanceEstimate: distanceEstimateSchema.nullable(),
  distance: z.number().nullable(),
  behaviors: z.array(behaviorSchema),
  environments: z.array(environmentSchema),
  comment: z.string().nullable(),
});

export type Entry = z.infer<typeof entrySchema>;
