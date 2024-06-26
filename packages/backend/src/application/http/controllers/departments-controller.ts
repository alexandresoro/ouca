import {
  departmentInfoSchema,
  getDepartmentResponse,
  getDepartmentsQueryParamsSchema,
  getDepartmentsResponse,
  upsertDepartmentInput,
  upsertDepartmentResponse,
} from "@ou-ca/common/api/department";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const departmentsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { departmentService } = services;

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const departmentResult = await departmentService.findDepartment(req.params.id, req.user);

    if (departmentResult.isErr()) {
      switch (departmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const department = departmentResult.value;

    if (!department) {
      return await reply.status(404).send();
    }

    const response = getDepartmentResponse.parse(department);
    return await reply.send(response);
  });

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id/info", async (req, reply) => {
    const departmentInfoResult = Result.combine([
      await departmentService.getEntriesCountByDepartment(`${req.params.id}`, req.user),
      await departmentService.isDepartmentUsed(`${req.params.id}`, req.user),
      await departmentService.getLocalitiesCountByDepartment(`${req.params.id}`, req.user),
      await departmentService.getTownsCountByDepartment(`${req.params.id}`, req.user),
    ]);

    if (departmentInfoResult.isErr()) {
      switch (departmentInfoResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [ownEntriesCount, isDepartmentUsed, localitiesCount, townsCount] = departmentInfoResult.value;

    const response = departmentInfoSchema.parse({
      canBeDeleted: !isDepartmentUsed,
      ownEntriesCount,
      localitiesCount,
      townsCount,
    });

    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getDepartmentsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await departmentService.findPaginatedDepartments(req.user, queryParams),
      await departmentService.getDepartmentsCount(req.user, queryParams.q),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [data, count] = paginatedResults.value;

    const response = getDepartmentsResponse.parse({
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
      }
    }

    const response = upsertDepartmentResponse.parse(departmentResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
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
      }
    }

    const response = upsertDepartmentResponse.parse(departmentResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedDepartmentResult = await departmentService.deleteDepartment(req.params.id, req.user);

    if (deletedDepartmentResult.isErr()) {
      switch (deletedDepartmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "isUsed":
          return await reply.status(409).send();
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
