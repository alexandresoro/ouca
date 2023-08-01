import { z } from "zod";
import { ageSchema } from "../entities/age.js";
import { departmentSchema } from "../entities/department.js";
import { numberEstimateSchema } from "../entities/number-estimate.js";
import { observerSchema } from "../entities/observer.js";
import { sexSchema } from "../entities/sex.js";

// Common response content returned when settings are queried or updated
const settingsResponse = z.object({
  defaultObserver: observerSchema.nullable(),
  defaultDepartment: departmentSchema.nullable(),
  defaultAge: ageSchema.nullable(),
  defaultSex: sexSchema.nullable(),
  defaultNumberEstimate: numberEstimateSchema.nullable(),
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
  defaultDepartment: z.string().nullable(),
  defaultObserver: z.string().nullable(),
  defaultEstimationNombre: z.string().nullable(),
  defaultNombre: z.coerce.number().min(1).max(65535).nullable(),
  defaultSexe: z.string().nullable(),
  defaultAge: z.string().nullable(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
});

export type PutSettingsInput = z.infer<typeof putSettingsInput>;

export const putSettingsResponse = settingsResponse;

export type UpdateSettingsResponse = z.infer<typeof getSettingsResponse>;
