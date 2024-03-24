import type { FastifyPluginCallback } from "fastify";
import type { Services } from "../application/services/services.js";

const generateExportController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { exportService } = services;

  fastify.post("/ages", async (req, reply) => {
    const id = await exportService.generateAgesExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/classes", async (req, reply) => {
    const id = await exportService.generateClassesExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/towns", async (req, reply) => {
    const id = await exportService.generateTownsExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/behaviors", async (req, reply) => {
    const id = await exportService.generateBehaviorsExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/departments", async (req, reply) => {
    const id = await exportService.generateDepartmentsExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/species", async (req, reply) => {
    const id = await exportService.generateSpeciesExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/distance-estimates", async (req, reply) => {
    const id = await exportService.generateDistanceEstimatesExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/number-estimates", async (req, reply) => {
    const id = await exportService.generateNumberEstimatesExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/localities", async (req, reply) => {
    const id = await exportService.generateLocalitiesExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/weathers", async (req, reply) => {
    const id = await exportService.generateWeathersExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/environments", async (req, reply) => {
    const id = await exportService.generateEnvironmentsExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/observers", async (req, reply) => {
    const id = await exportService.generateObserversExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/sexes", async (req, reply) => {
    const id = await exportService.generateSexesExport();
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/entries", async (req, reply) => {
    // TODO add search criteria
    const id = await exportService.generateEntriesExport(req.user, {});
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  done();
};

export default generateExportController;
