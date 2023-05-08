import { getSettingsResponse, putSettingsInput, putSettingsResponse } from "@ou-ca/common/api/settings";
import { type FastifyPluginCallback } from "fastify";
import { type Services } from "../services/services.js";

const settingsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { settingsService } = services;

  fastify.get("/", async (req, reply) => {
    const settings = await settingsService.getSettings(req.user);
    if (settings) {
      const response = getSettingsResponse.parse(settings);
      return await reply.send(response);
    } else {
      return await reply.status(404).send();
    }
  });

  fastify.put("/", async (req, reply) => {
    const parsedInputResult = putSettingsInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    const updatedSettings = await settingsService.updateUserSettings(input, req.user);
    const response = putSettingsResponse.parse(updatedSettings);

    return await reply.send(response);
  });

  done();
};

export default settingsController;
