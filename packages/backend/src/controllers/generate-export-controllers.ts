import { type FastifyPluginCallback } from "fastify";
import {
  generateAgesExport,
  generateClassesExport,
  generateCommunesExport,
  generateComportementsExport,
  generateDepartementsExport,
  generateDonneesExport,
  generateEspecesExport,
  generateEstimationsDistanceExport,
  generateEstimationsNombreExport,
  generateLieuxDitsExport,
  generateMeteosExport,
  generateMilieuxExport,
  generateObservateursExport,
  generateSexesExport,
} from "../services/export-entites.js";
import { type Services } from "../services/services.js";

const generateExportController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  fastify.post("/ages", async (req, reply) => {
    const id = await generateAgesExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/classes", async (req, reply) => {
    const id = await generateClassesExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/towns", async (req, reply) => {
    const id = await generateCommunesExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/behaviors", async (req, reply) => {
    const id = await generateComportementsExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/departments", async (req, reply) => {
    const id = await generateDepartementsExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/species", async (req, reply) => {
    const id = await generateEspecesExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/distance-estimates", async (req, reply) => {
    const id = await generateEstimationsDistanceExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/number-estimates", async (req, reply) => {
    const id = await generateEstimationsNombreExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/localities", async (req, reply) => {
    const id = await generateLieuxDitsExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/weathers", async (req, reply) => {
    const id = await generateMeteosExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/environments", async (req, reply) => {
    const id = await generateMilieuxExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/observers", async (req, reply) => {
    const id = await generateObservateursExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/sexes", async (req, reply) => {
    const id = await generateSexesExport(services);
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  fastify.post("/entries", async (req, reply) => {
    // TODO add search criteria
    const id = await generateDonneesExport(services, req.user, {});
    return reply.header("Location", `${req.protocol}://${req.hostname}/download/${id}`).status(201).send();
  });

  done();
};

export default generateExportController;
