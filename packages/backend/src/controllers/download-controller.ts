import contentDisposition from "content-disposition";
import { type FastifyPluginCallback } from "fastify";
import { EXPORT_ENTITY_RESULT_PREFIX } from "../services/export-entites.js";
import { type Services } from "../services/services.js";

const downloadController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { redis } = services;

  fastify.get<{ Params: { id: string }; Querystring: { filename?: string } }>("/:id", async (req, reply) => {
    // Try to retrieve download from cache first
    const downloadFromCacheBuffer = await redis.getBuffer(`${EXPORT_ENTITY_RESULT_PREFIX}:${req.params.id}`);
    if (downloadFromCacheBuffer != null) {
      return reply.header("content-disposition", contentDisposition(req.query.filename)).send(downloadFromCacheBuffer);
    } else {
      return reply.status(404).send();
    }
  });

  done();
};

export default downloadController;
