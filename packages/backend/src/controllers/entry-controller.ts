import { type FastifyPluginCallback } from "fastify";
import { type Services } from "../services/services.js";

const entryController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { donneeService } = services;

  fastify.get("/last", async (req, reply) => {
    const id = await donneeService.findLastDonneeId(req.user);
    await reply.send({ id });
  });

  done();
};

export default entryController;
