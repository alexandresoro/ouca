import { z } from "zod";
import { weatherSchema } from "../entities/weather.js";

/**
 * `GET` `/weather/:id`
 *  Retrieve weather entity
 */
export const getWeatherResponse = weatherSchema.omit({ editable: true });

export type GetWeatherResponse = z.infer<typeof getWeatherResponse>;

/**
 * `PUT` `/weather/:id` Update of weather entity
 * `POST` `/weather` Create new weather entity
 */
export const upsertWeatherInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertWeatherInput = z.infer<typeof upsertWeatherInput>;

export const upsertWeatherResponse = weatherSchema.omit({ editable: true });

export type UpsertWeatherResponse = z.infer<typeof upsertWeatherResponse>;
