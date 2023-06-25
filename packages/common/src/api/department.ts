import { z } from "zod";
import { departmentExtendedSchema, departmentSchema } from "../entities/department.js";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/department/:id`
 *  Retrieve department entity
 */
export const getDepartmentResponse = departmentSchema;

export type GetDepartmentResponse = z.infer<typeof getDepartmentResponse>;

/**
 * `GET` `/departments`
 *  Retrieve paginated departments results
 */
export const DEPARTMENTS_ORDER_BY_ELEMENTS = ["id", "code", "nbCommunes", "nbLieuxDits", "nbDonnees"] as const;
export type DepartmentsOrderBy = typeof DEPARTMENTS_ORDER_BY_ELEMENTS[number];

export const getDepartmentsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(DEPARTMENTS_ORDER_BY_ELEMENTS).optional(),
});

export type DepartmentsSearchParams = Omit<z.infer<typeof getDepartmentsQueryParamsSchema>, "extended">;

export const getDepartmentsResponse = getPaginatedResponseSchema(departmentSchema);

export const getDepartmentsExtendedResponse = getPaginatedResponseSchema(departmentExtendedSchema);

/**
 * `PUT` `/department/:id` Update of department entity
 * `POST` `/department` Create new department entity
 */
export const upsertDepartmentInput = z.object({
  code: z.string(),
});

export type UpsertDepartmentInput = z.infer<typeof upsertDepartmentInput>;

export const upsertDepartmentResponse = departmentSchema;

export type UpsertDepartmentResponse = z.infer<typeof upsertDepartmentResponse>;
