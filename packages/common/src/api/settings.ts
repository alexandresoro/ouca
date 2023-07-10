import { z } from "zod";
import { departmentSchema } from "../entities/department.js";
import { observerSchema } from "../entities/observer.js";

// Common response content returned when settings are queried or updated
const settingsResponse = z.object({
  defaultObserver: observerSchema.nullable(),
  defaultDepartment: departmentSchema.nullable(),
  defaultAgeId: z.string().nullable(),
  defaultSexeId: z.string().nullable(),
  defaultEstimationNombreId: z.string().nullable(),
  defaultNombre: z.number().nullable(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
});

/**
 * `GET` `/settings`
 *  Retrieve user settings
 */
export const getSettingsResponse = settingsResponse;

export type GetSettingsResponse = z.infer<typeof getSettingsResponse>;

/**
 * `PUT` `/settings`
 * Update of user settings
 */
export const putSettingsInput = z.object({
  defaultDepartment: z.string(),
  defaultObserver: z.string(),
  defaultEstimationNombre: z.string(),
  defaultNombre: z.coerce.number().min(1).max(65535),
  defaultSexe: z.string(),
  defaultAge: z.string(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
});

export type PutSettingsInput = z.infer<typeof putSettingsInput>;

export const putSettingsResponse = settingsResponse;

export type UpdateSettingsResponse = z.infer<typeof getSettingsResponse>;
