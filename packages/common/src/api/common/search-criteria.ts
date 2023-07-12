import { z } from "zod";
import { NICHEUR_CODES } from "../../types/nicheur.model.js";

export const getSearchCriteriaParamsSchema = z.object({
  entryId: z.string().optional(),
  observerIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  temperature: z.number().optional(),
  weatherIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  associateIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  time: z.string().optional(),
  duration: z.string().optional(),
  classIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  speciesIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  departmentIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  townIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  localityIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  number: z.number().optional(),
  numberEstimateIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  sexIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  ageIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  distance: z.number().optional(),
  distanceEstimateIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  regroupment: z.number().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  comment: z.string().optional(),
  breeders: z.array(z.enum(NICHEUR_CODES)).optional(),
  behaviorIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  environmentIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
});

export type SearchCriteriaParams = z.infer<typeof getSearchCriteriaParamsSchema>;
