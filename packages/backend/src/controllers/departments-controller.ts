import { OucaError } from "@domain/errors/ouca-error.js";
import {
  getDepartmentResponse,
  getDepartmentsExtendedResponse,
  getDepartmentsQueryParamsSchema,
  getDepartmentsResponse,
  upsertDepartmentInput,
  upsertDepartmentResponse,
} from "@ou-ca/common/api/department";
import { type Department, type DepartmentExtended } from "@ou-ca/common/api/entities/department";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

const departmentsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { departmentService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const department = await departmentService.findDepartement(req.params.id, req.user);
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

    const [departmentsData, count] = await Promise.all([
      departmentService.findPaginatedDepartements(req.user, queryParams),
      departmentService.getDepartementsCount(req.user, queryParams.q),
    ]);

    let data: Department[] | DepartmentExtended[] = departmentsData;
    if (extended) {
      data = await Promise.all(
        departmentsData.map(async (departmentData) => {
          const localitiesCount = await departmentService.getLieuxDitsCountByDepartement(departmentData.id, req.user);
          const townsCount = await departmentService.getCommunesCountByDepartement(departmentData.id, req.user);
          const entriesCount = await departmentService.getDonneesCountByDepartement(departmentData.id, req.user);
          return {
            ...departmentData,
            localitiesCount,
            townsCount,
            entriesCount,
          };
        })
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

    try {
      const department = await departmentService.createDepartement(input, req.user);
      const response = upsertDepartmentResponse.parse(department);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
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

    try {
      const department = await departmentService.updateDepartement(req.params.id, input, req.user);
      const response = upsertDepartmentResponse.parse(department);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await departmentService.deleteDepartement(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
      }
      throw e;
    }
  });

  done();
};

export default departmentsController;
