import { z } from "zod";

/**
 * `GET` `/me`
 *  Retrieve own user profile
 */
const userSettingsSchema = z
  .object({
    defaultObserverId: z.string().optional(),
    defaultDepartmentId: z.string().optional(),
    defaultAgeId: z.string().optional(),
    defaultSexId: z.string().optional(),
    defaultNumberEstimateId: z.string().optional(),
    defaultNumber: z.number().optional(),
    displayAssociates: z.boolean().optional(),
    displayWeather: z.boolean().optional(),
    displayDistance: z.boolean().optional(),
    displayGrouping: z.boolean().optional(),
  })
  .nullable();

const getMeUser = z.object({
  sub: z.string(),
  iss: z.string(),
  username: z.string().optional(),
  exp: z.number(), // Expiration date as unix time
  email: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  name: z.string().optional(),
  // The following lines are non-standard claims
  oidcProvider: z.string(),
  roles: z.array(z.enum(["admin", "contributor", "user"])),
});

export const getMeResponse = z.object({
  id: z.string().uuid(),
  user: getMeUser,
  settings: userSettingsSchema,
});

export type GetMeResponse = z.infer<typeof getMeResponse>;