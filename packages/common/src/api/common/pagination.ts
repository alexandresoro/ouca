import { z } from "zod";

// INPUT
export const paginationQueryParamsSchema = z.object({
  pageNumber: z.coerce.number().int().positive().safe().optional(),
  pageSize: z.coerce.number().int().positive().safe().optional(),
});

// OUTPUT
const paginationMetadataSchema = z.object({
  count: z.number(),
});

export const getPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataElement: T) =>
  z.object({
    data: z.array(dataElement),
    meta: paginationMetadataSchema,
  });
