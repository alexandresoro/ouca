import { z } from "zod";
import { localityExtendedSchema, localitySchema } from "../entities/locality.js";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/locality/:id`
 *  Retrieve locality entity
 */
export const getLocalityResponse = localitySchema;

export type GetLocalityResponse = z.infer<typeof getLocalityResponse>;

/**
 * `GET` `/localities`
 *  Retrieve paginated localities results
 */
export const LOCALITIES_ORDER_BY_ELEMENTS = [
  "id",
  "nom",
  "altitude",
  "longitude",
  "latitude",
  "codeCommune",
  "nomCommune",
  "departement",
  "nbDonnees",
] as const;
export type LocalitiesOrderBy = typeof LOCALITIES_ORDER_BY_ELEMENTS[number];

export const getLocalitiesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(LOCALITIES_ORDER_BY_ELEMENTS).optional(),
  townId: z.string().optional(),
});

export type LocalitiesSearchParams = Omit<z.infer<typeof getLocalitiesQueryParamsSchema>, "extended">;

export const getLocalitiesResponse = getPaginatedResponseSchema(localitySchema);

export const getLocalitiesExtendedResponse = getPaginatedResponseSchema(localityExtendedSchema);

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
});

export type UpsertLocalityInput = z.infer<typeof upsertLocalityInput>;

export const upsertLocalityResponse = localitySchema;

export type UpsertLocalityResponse = z.infer<typeof upsertLocalityResponse>;
