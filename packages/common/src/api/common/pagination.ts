import { z } from "zod";

export const paginationSchema = z.object({
  count: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;
