import { z } from "zod";
import { weatherExtendedSchema, weatherSchema } from "../entities/weather.js";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/weather/:id`
 *  Retrieve weather entity
 */
export const getWeatherResponse = weatherSchema;

export type GetWeatherResponse = z.infer<typeof getWeatherResponse>;

/**
 * `GET` `/weathers`
 *  Retrieve paginated weathers results
 */
export const getWeathersQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type WeathersSearchParams = Omit<z.infer<typeof getWeathersQueryParamsSchema>, "extended">;

export const getWeathersResponse = getPaginatedResponseSchema(weatherSchema);

export const getWeathersExtendedResponse = getPaginatedResponseSchema(weatherExtendedSchema);

/**
 * `PUT` `/weather/:id` Update of weather entity
 * `POST` `/weather` Create new weather entity
 */
export const upsertWeatherInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertWeatherInput = z.infer<typeof upsertWeatherInput>;

export const upsertWeatherResponse = weatherSchema;

export type UpsertWeatherResponse = z.infer<typeof upsertWeatherResponse>;
