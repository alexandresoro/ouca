import { z } from "zod";
import { departmentSchema } from "../entities/department.js";

/**
 * `GET` `/department/:id`
 *  Retrieve department entity
 */
export const getDepartmentResponse = departmentSchema.omit({ editable: true });

export type GetDepartmentResponse = z.infer<typeof getDepartmentResponse>;

/**
 * `PUT` `/department/:id` Update of department entity
 * `POST` `/department` Create new department entity
 */
export const upsertDepartmentInput = z.object({
  code: z.string(),
});

export type UpsertDepartmentInput = z.infer<typeof upsertDepartmentInput>;

export const upsertDepartmentResponse = departmentSchema.omit({ editable: true });

export type UpsertDepartmentResponse = z.infer<typeof upsertDepartmentResponse>;
