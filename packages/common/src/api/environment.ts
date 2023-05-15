import { z } from "zod";
import { environmentSchema } from "../entities/environment.js";

/**
 * `GET` `/environment/:id`
 *  Retrieve environment entity
 */
export const getEnvironmentResponse = environmentSchema.omit({ editable: true });

export type GetEnvironmentResponse = z.infer<typeof getEnvironmentResponse>;

/**
 * `PUT` `/environment/:id` Update of environment entity
 * `POST` `/environment` Create new environment entity
 */
export const upsertEnvironmentInput = z.object({
  code: z.string().trim().min(1),
  libelle: z.string().trim().min(1),
});

export type UpsertEnvironmentInput = z.infer<typeof upsertEnvironmentInput>;

export const upsertEnvironmentResponse = environmentSchema.omit({ editable: true });

export type UpsertEnvironmentResponse = z.infer<typeof upsertEnvironmentResponse>;
