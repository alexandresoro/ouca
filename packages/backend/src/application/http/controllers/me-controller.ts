import type { User } from "@domain/user/user.js";
import { getMeResponse, putMeInput } from "@ou-ca/common/api/me";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { Services } from "../../services/services.js";

export const meController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { oidcService, userService } = services;

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["User"],
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return await reply.status(401).send();
      }

      const userResult = await oidcService.findLoggedUserFromProvider(
        req.user.oidcUser.oidcProvider,
        req.user.oidcUser.sub,
      );

      if (userResult.isErr()) {
        return await reply.status(404).send("Internal user not found");
      }

      const { id, settings } = userResult.value;

      const responseBody = getMeResponse.parse({
        id,
        settings,
        user: req.user.oidcUser,
        permissions: req.user.permissions,
      });

      return await reply.send(responseBody);
    },
  );

  fastify.put(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["User"],
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return await reply.status(401).send();
      }

      const parsedInputResult = putMeInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const reshapedInput = {
        defaultObserverId: input.defaultObserver ?? undefined,
        defaultDepartmentId: input.defaultDepartment ?? undefined,
        defaultAgeId: input.defaultAge ?? undefined,
        defaultSexId: input.defaultSexe ?? undefined,
        defaultNumberEstimateId: input.defaultEstimationNombre ?? undefined,
        defaultNumber: input.defaultNombre ?? undefined,
        displayAssociates: input.areAssociesDisplayed ?? undefined,
        displayWeather: input.isMeteoDisplayed ?? undefined,
        displayDistance: input.isDistanceDisplayed ?? undefined,
      } satisfies User["settings"];

      const updatedUser = await userService.updateSettings(req.user.id, reshapedInput);

      const { id, settings } = updatedUser;

      const responseBody = getMeResponse.parse({
        id,
        settings,
        user: req.user.oidcUser,
        permissions: req.user.permissions,
      });

      return await reply.send(responseBody);
    },
  );

  done();
};
