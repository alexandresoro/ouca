import { z } from "zod";
import { NICHEUR_CODES } from "../../types/nicheur.model.js";

export const getSearchCriteriaParamsSchema = z.object({
  entryId: z.string().optional(),
  observerIds: z.array(z.string()).optional(),
  temperature: z.number().optional(),
  weatherIds: z.array(z.string()).optional(),
  associateIds: z.array(z.string()).optional(),
  time: z.string().optional(),
  duration: z.string().optional(),
  classIds: z.array(z.string()).optional(),
  speciesIds: z.array(z.string()).optional(),
  departmentIds: z.array(z.string()).optional(),
  townIds: z.array(z.string()).optional(),
  localityIds: z.array(z.string()).optional(),
  number: z.number().optional(),
  numberEstimateIds: z.array(z.string()).optional(),
  sexIds: z.array(z.string()).optional(),
  ageIds: z.array(z.string()).optional(),
  distance: z.number().optional(),
  distanceEstimateIds: z.array(z.string()).optional(),
  regroupment: z.number().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  comment: z.string().optional(),
  breeders: z.array(z.enum(NICHEUR_CODES)).optional(),
  behaviorIds: z.array(z.string()).optional(),
  environmentIds: z.array(z.string()).optional(),
});

export type SearchCriteriaParams = z.infer<typeof getSearchCriteriaParamsSchema>;
