import { z } from "zod";

// Common response content returned when age is queried or upserted
const ageResponse = z.object({
  id: z.number(),
  libelle: z.string(),
});

/**
 * `GET` `/age/:id`
 *  Retrieve age entity
 */
export const getAgeResponse = ageResponse;

export type GetAgeResponse = z.infer<typeof getAgeResponse>;

/**
 * `PUT` `/age/:id` Update of age entity
 * `POST` `/age` Create new age entity
 */
export const upsertAgeInput = z.object({
  libelle: z.string(),
});

export type UpsertAgeInput = z.infer<typeof upsertAgeInput>;

export const upsertAgeResponse = ageResponse;

export type UpsertAgeResponse = z.infer<typeof upsertAgeResponse>;
