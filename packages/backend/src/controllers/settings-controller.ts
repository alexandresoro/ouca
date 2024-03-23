import { getSettingsResponse, putSettingsInput, putSettingsResponse } from "@ou-ca/common/api/settings";
import type { FastifyPluginCallback } from "fastify";
import type { Services } from "../application/services/services.js";
import { logger } from "../utils/logger.js";

const settingsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { settingsService } = services;

  fastify.get("/", async (req, reply) => {
    const settingsResult = await settingsService.getSettings(req.user);

    if (settingsResult.isErr()) {
      switch (settingsResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: settingsResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const settings = settingsResult.value;

    if (settings) {
      const response = getSettingsResponse.parse(settings);
      return await reply.send(response);
    }

    return await reply.status(404).send();
  });

  fastify.put("/", async (req, reply) => {
    const parsedInputResult = putSettingsInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const updatedSettingsResult = await settingsService.updateUserSettings(input, req.user);

    if (updatedSettingsResult.isErr()) {
      switch (updatedSettingsResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: updatedSettingsResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = putSettingsResponse.parse(updatedSettingsResult.value);

    return await reply.send(response);
  });

  done();
};

export default settingsController;
