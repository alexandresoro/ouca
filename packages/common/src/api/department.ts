import { z } from "zod";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { departmentSchema } from "./entities/department.js";

/**
 * `GET` `/department/:id`
 *  Retrieve department entity
 */
export const getDepartmentResponse = departmentSchema;

export type GetDepartmentResponse = z.infer<typeof getDepartmentResponse>;

/**
 * `GET` `/department/:id/info`
 *  Retrieve department info
 */
export const departmentInfoSchema = entityInfoSchema.extend({
  localitiesCount: z.number(),
  townsCount: z.number(),
});

/**
 * `GET` `/departments`
 *  Retrieve paginated departments results
 */
export const DEPARTMENTS_ORDER_BY_ELEMENTS = ["id", "code", "nbCommunes", "nbLieuxDits", "nbDonnees"] as const;
export type DepartmentsOrderBy = (typeof DEPARTMENTS_ORDER_BY_ELEMENTS)[number];

export const getDepartmentsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(DEPARTMENTS_ORDER_BY_ELEMENTS).optional(),
});

export type DepartmentsSearchParams = z.infer<typeof getDepartmentsQueryParamsSchema>;

export const getDepartmentsResponse = getPaginatedResponseSchema(departmentSchema);

/**
 * `PUT` `/department/:id` Update of department entity
 * `POST` `/department` Create new department entity
 */
export const upsertDepartmentInput = z.object({
  code: z.string().trim().min(1),
});

export type UpsertDepartmentInput = z.infer<typeof upsertDepartmentInput>;

export const upsertDepartmentResponse = departmentSchema;

export type UpsertDepartmentResponse = z.infer<typeof upsertDepartmentResponse>;
