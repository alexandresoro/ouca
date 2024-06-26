import { getSearchCriteriaParamsSchema } from "@ou-ca/common/api/common/search-criteria";
import type { FastifyPluginCallback, FastifyRequest } from "fastify";
import type { Services } from "../../services/services.js";

const getExportUrl = (req: FastifyRequest, exportId: string) => {
  return `${req.protocol}://${req.hostname}/download/${exportId}`;
};

export const generateExportController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { exportService } = services;

  fastify.post("/ages", async (req, reply) => {
    const idResult = await exportService.generateAgesExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/classes", async (req, reply) => {
    const idResult = await exportService.generateClassesExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/towns", async (req, reply) => {
    const idResult = await exportService.generateTownsExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/behaviors", async (req, reply) => {
    const idResult = await exportService.generateBehaviorsExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/departments", async (req, reply) => {
    const idResult = await exportService.generateDepartmentsExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/species", async (req, reply) => {
    const idResult = await exportService.generateSpeciesExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/distance-estimates", async (req, reply) => {
    const idResult = await exportService.generateDistanceEstimatesExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/number-estimates", async (req, reply) => {
    const idResult = await exportService.generateNumberEstimatesExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/localities", async (req, reply) => {
    const idResult = await exportService.generateLocalitiesExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/weathers", async (req, reply) => {
    const idResult = await exportService.generateWeathersExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/environments", async (req, reply) => {
    const idResult = await exportService.generateEnvironmentsExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/observers", async (req, reply) => {
    const idResult = await exportService.generateObserversExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/sexes", async (req, reply) => {
    const idResult = await exportService.generateSexesExport(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  fastify.post("/entries", async (req, reply) => {
    const parsedQueryParamsResult = getSearchCriteriaParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    if (queryParams.fromAllUsers && !req.user?.permissions.canViewAllEntries) {
      return await reply.status(403).send();
    }

    // If we don't want to see all users' entries, we need to filter by ownerId
    const reshapedQueryParams = {
      ...queryParams,
      ownerId: queryParams.fromAllUsers ? undefined : req.user?.id,
    };

    // TODO add search criteria
    const idResult = await exportService.generateEntriesExport(req.user, reshapedQueryParams);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
  });

  done();
};
