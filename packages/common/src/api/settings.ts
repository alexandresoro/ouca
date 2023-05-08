import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../coordinates-system/coordinates-system.object.js";
import { department } from "../entities/department.js";
import { observer } from "../entities/observer.js";

/**
 * `GET` `/settings`
 */
export const getSettingsResponse = z.object({
  id: z.number(),
  defaultObserver: observer.nullable(),
  defaultDepartment: department.nullable(),
  defaultAgeId: z.number().nullable(),
  defaultSexeId: z.number().nullable(),
  defaultEstimationNombreId: z.number().nullable(),
  defaultNombre: z.number().nullable(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
  coordinatesSystem: z.enum(COORDINATES_SYSTEMS),
});

export type GetSettingsResponse = z.infer<typeof getSettingsResponse>;

/**
 *
 */
export const updateSettingsInput = z.object({
  defaultDepartment: z.coerce.string(),
  defaultObserver: z.coerce.string(),
  defaultEstimationNombre: z.number(),
  defaultNombre: z.coerce.number().min(1).max(65535),
  defaultSexe: z.number(),
  defaultAge: z.number(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
  coordinatesSystem: z.enum(COORDINATES_SYSTEMS),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsInput>;
