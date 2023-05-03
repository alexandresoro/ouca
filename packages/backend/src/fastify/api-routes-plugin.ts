import { type FastifyPluginAsync } from "fastify";
import entryController from "../controllers/entry-controller.js";
import observerController from "../controllers/observer-controller.js";
import userController from "../controllers/user-controller.js";
import { type Services } from "../services/services.js";
import handleAuthorizationHook from "./handle-authorization-hook.js";

const apiRoutesPlugin: FastifyPluginAsync<{ services: Services }> = async (fastify, { services }) => {
  // API needs authentication/authorization
  fastify.decorateRequest("user", null);
  fastify.addHook("onRequest", async (request, reply) => {
    await handleAuthorizationHook(request, reply, services);
  });

  await fastify.register(entryController, { services, prefix: "/entry" });
  await fastify.register(observerController, { services, prefix: "/observer" });
  await fastify.register(userController, { services, prefix: "/user" });
};

export default apiRoutesPlugin;
