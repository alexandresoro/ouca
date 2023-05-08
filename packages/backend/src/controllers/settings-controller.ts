import { getSettingsResponse } from "@ou-ca/common/api/settings";
import { type FastifyPluginCallback } from "fastify";
import { type Services } from "../services/services.js";

const settingsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { settingsService } = services;

  fastify.get("/", async (req, reply) => {
    const settings = await settingsService.findAppConfiguration(req.user);
    if (settings) {
      const response = getSettingsResponse.parse(settings);
      return await reply.send(response);
    } else {
      return await reply.status(404).send();
    }
  });

  done();
};

export default settingsController;
