import { z } from "zod";

// INPUT
export const paginationQueryParamsSchema = z.object({
  pageNumber: z.coerce.number().int().positive().safe().optional(),
  pageSize: z.coerce.number().int().positive().safe().optional(),
});

// OUTPUT
const paginationMetadataSchema = z.object({
  pageNumber: z.number().int().positive().safe().optional(),
  pageSize: z.number().int().positive().safe().optional(),
  count: z.number(),
});

export type PaginationMetadata = z.infer<typeof paginationMetadataSchema>;

export const getPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataElement: T) =>
  z.object({
    data: z.array(dataElement),
    meta: paginationMetadataSchema,
  });

export type PaginatedResponseSchemaType<T extends z.ZodTypeAny> = ReturnType<typeof getPaginatedResponseSchema<T>>;
