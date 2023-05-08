import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";

const entryController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { donneeService } = services;

  fastify.get("/last", async (req, reply) => {
    const id = await donneeService.findLastDonneeId(req.user);
    await reply.send({ id });
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await donneeService.deleteDonnee(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
      }
      throw e;
    }
  });

  fastify.get("/next-regroupment", async (req, reply) => {
    const id = await donneeService.findNextRegroupement(req.user);
    await reply.send({ id });
  });

  done();
};

export default entryController;
