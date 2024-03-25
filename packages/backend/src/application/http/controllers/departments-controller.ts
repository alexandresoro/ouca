import {
  getDepartmentResponse,
  getDepartmentsExtendedResponse,
  getDepartmentsQueryParamsSchema,
  getDepartmentsResponse,
  upsertDepartmentInput,
  upsertDepartmentResponse,
} from "@ou-ca/common/api/department";
import type { Department, DepartmentExtended } from "@ou-ca/common/api/entities/department";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const departmentsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { departmentService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const departmentResult = await departmentService.findDepartment(req.params.id, req.user);

    if (departmentResult.isErr()) {
      switch (departmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: departmentResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const department = departmentResult.value;

    if (!department) {
      return await reply.status(404).send();
    }

    const response = getDepartmentResponse.parse(department);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getDepartmentsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await departmentService.findPaginatedDepartments(req.user, queryParams),
      await departmentService.getDepartmentsCount(req.user, queryParams.q),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: paginatedResults.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const [departmentsData, count] = paginatedResults.value;

    let data: Department[] | DepartmentExtended[] = departmentsData;
    if (extended) {
      data = await Promise.all(
        departmentsData.map(async (departmentData) => {
          const localitiesCount = (
            await departmentService.getLocalitiesCountByDepartment(departmentData.id, req.user)
          )._unsafeUnwrap();
          const townsCount = (
            await departmentService.getTownsCountByDepartment(departmentData.id, req.user)
          )._unsafeUnwrap();
          const entriesCount = (
            await departmentService.getEntriesCountByDepartment(departmentData.id, req.user)
          )._unsafeUnwrap();
          return {
            ...departmentData,
            localitiesCount,
            townsCount,
            entriesCount,
          };
        }),
      );
    }

    const responseParser = extended ? getDepartmentsExtendedResponse : getDepartmentsResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertDepartmentInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const departmentResult = await departmentService.createDepartment(input, req.user);

    if (departmentResult.isErr()) {
      switch (departmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: departmentResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertDepartmentResponse.parse(departmentResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertDepartmentInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const departmentResult = await departmentService.updateDepartment(req.params.id, input, req.user);

    if (departmentResult.isErr()) {
      switch (departmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: departmentResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertDepartmentResponse.parse(departmentResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedDepartmentResult = await departmentService.deleteDepartment(req.params.id, req.user);

    if (deletedDepartmentResult.isErr()) {
      switch (deletedDepartmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedDepartmentResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedDepartment = deletedDepartmentResult.value;

    if (!deletedDepartment) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedDepartment.id });
  });

  done();
};
