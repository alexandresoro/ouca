import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../coordinates-system/coordinates-system.object.js";
import { localitySchema } from "../entities/locality.js";

/**
 * `GET` `/locality/:id`
 *  Retrieve locality entity
 */
export const getLocalityResponse = localitySchema.omit({ editable: true });

export type GetLocalityResponse = z.infer<typeof getLocalityResponse>;

/**
 * `PUT` `/locality/:id` Update of locality entity
 * `POST` `/locality` Create new locality entity
 */
export const upsertLocalityInput = z.object({
  townId: z.string().trim().min(1),
  nom: z.string().trim().min(1),
  altitude: z.coerce.number(),
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
  coordinatesSystem: z.enum(COORDINATES_SYSTEMS),
});

export type UpsertLocalityInput = z.infer<typeof upsertLocalityInput>;

export const upsertLocalityResponse = localitySchema.omit({ editable: true });

export type UpsertLocalityResponse = z.infer<typeof upsertLocalityResponse>;
